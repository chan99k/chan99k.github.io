---
title: "@ApplicationModuleListener 전환 후 이벤트 멱등성 확보: 2계층 방어 설계기"
description: "@TransactionalEventListener(at-most-once)에서 @ApplicationModuleListener(at-least-once)로 전환하면서 리스너가 중복 호출될 수 있게 되었다. 3개 리스너 중 2개가 멱등하지 않았고, Redis AOP(1차) + 서비스 레벨 가드(2차)의 2계층 방어로 해결했다."
pubDate: "2026-02-24"
tags: ["아키텍처", "개발/Spring"]
draft: false
---

# @ApplicationModuleListener 전환 후 이벤트 멱등성 확보: 2계층 방어 설계기

## TL;DR

`@TransactionalEventListener`(at-most-once)에서 `@ApplicationModuleListener`(at-least-once)로 전환하면서 리스너가 중복 호출될 수 있게 되었다. 3개 리스너 중 2개가 멱등하지 않았고, Redis AOP(1차) + 서비스 레벨 가드(2차)의 2계층 방어로 해결했다.

## 배경

### 시스템 구조

Giftify는 Spring Modulith 기반 모듈러 모놀리스다. 모듈 간 통신에 도메인 이벤트를 사용한다.

```
┌─────────────────────────────────────────────────┐
│                bootstrap/api-server              │
├─────────┬──────────┬───────────┬────────────────┤
│ bc/member│bc/catalog│  bc/core  │ bc/settlement  │
│  (회원)  │(위시/카트)│(펀딩/주문)│    (정산)      │
├─────────┴──────────┴───────────┴────────────────┤
│              bc/shared (이벤트 정의)              │
└─────────────────────────────────────────────────┘
```

### 전환 배경

기존에는 `@TransactionalEventListener`를 사용했다. 이 어노테이션은 퍼블리싱 트랜잭션이 커밋된 후 리스너를 실행하는데, 리스너 실행 중 실패하면 이벤트가 유실된다. **at-most-once** 전달 보장이다.

`@ApplicationModuleListener`로 전환하면 Spring Modulith의 Event Publication Registry가 이벤트를 DB에 기록하고, 리스너 실패 시 incomplete 상태로 남겨둔다. 애플리케이션 재시작이나 스케줄링을 통해 incomplete 이벤트를 재시도할 수 있다. **at-least-once** 전달 보장이다.

```
@TransactionalEventListener (기존)
  이벤트 발행 → 리스너 실행 → 실패 시 유실
  보장: at-most-once

@ApplicationModuleListener (전환 후)
  이벤트 발행 → DB 기록 → 리스너 실행 → 실패 시 incomplete 유지 → 재시도
  보장: at-least-once
```

at-least-once는 "최소 한 번은 전달한다"는 의미이지만, 뒤집으면 "두 번 이상 전달될 수 있다"는 뜻이기도 하다.

## 발견 과정

### Q1: 전환 대상 리스너는 어떤 것들이 있고, 현재 멱등한가?

프로젝트에 `@TransactionalEventListener`를 사용하는 리스너 3개를 찾았다.

| 리스너 | 호출 메서드 | 멱등 여부 |
|--------|-------------|-----------|
| `MemberReplicaEventListener` | `syncMember(id, nickname)` | O — findById + ifPresentOrElse upsert |
| `MemberSignedEventListener` | `createCart(memberId)` | X — 중복 시 ConstraintViolationException |
| `OrderCanceledEventListener` | `withdrawByWishlistItem(...)` | X — 이중 금액 차감 |

`MemberReplicaEventListener`는 이미 upsert 패턴을 쓰고 있어서 몇 번을 호출해도 안전했다. 하지만 나머지 2개는 문제가 있었다.

`createCart()`는 무조건 `save(Cart.create(memberId))`를 호출하므로, 두 번째 호출 시 unique constraint 위반이 발생한다. `withdrawByWishlistItem()`은 participant 존재 여부를 확인하지 않고 바로 금액을 차감하므로, 재시도 시 이중 차감이 일어난다.

### Q2: 기존 @Idempotent 인프라를 이벤트 리스너에 재사용할 수 있는가?

프로젝트에 이미 HTTP 요청 멱등성을 위한 인프라가 있었다.

```
support/web/.../idempotency/
  aop/
    Idempotent.java          -- 어노테이션
    IdempotencyAspect.java   -- AOP Around advice
  manager/
    IdempotencyManager.java  -- Redis SETNX 기반 락
  util/
    PayloadHasher.java       -- SHA-256 해시
  IdempotencyValue.java      -- status + payloadHash
```

`IdempotencyAspect`를 열어보니 `RequestContextHolder.getRequestAttributes()`로 HTTP 요청에서 `X-Idempotency-Key` 헤더를 추출하고 있었다. 이벤트 리스너는 HTTP 컨텍스트 밖에서 실행되므로 `RequestContextHolder`가 null을 반환한다. **직접 재사용 불가**.

하지만 하위 컴포넌트들을 살펴보니 상황이 달랐다:

- `IdempotencyManager`: Redis SETNX 연산만 담당. HTTP 의존성 없음.
- `PayloadHasher`: SHA-256 해시 생성. HTTP 의존성 없음.
- `IdempotencyValue`: status + payloadHash 레코드. HTTP 의존성 없음.

즉, HTTP에 결합된 것은 `IdempotencyAspect` 한 클래스뿐이었다. 나머지는 그대로 재사용 가능했다.

추가로 `BaseDomainEvent.getEventId()`가 UUID를 자동 생성하는 것을 발견했다. HTTP의 `X-Idempotency-Key` 헤더 대신 이 `eventId`를 멱등성 키로 쓸 수 있었다.

### Q3: 어떤 접근법이 적합한가?

세 가지 접근법을 비교했다.

**A: @EventIdempotent AOP만 적용 (Redis 기반)**
- Redis SETNX로 eventId 기반 중복 필터링
- 장점: 비즈니스 코드 변경 없음
- 단점: Redis 장애 시 방어 불가

**B: 서비스 레벨 가드만 적용 (DB 기반)**
- find-or-create, exists 체크 등 비즈니스 로직 수정
- 장점: 외부 의존성 없음
- 단점: 리스너마다 개별 분석 필요, 일부 케이스에서 완벽한 가드가 어려울 수 있음

**C: 하이브리드 (A + B)**
- AOP로 99% 중복 차단 + 서비스 가드로 나머지 방어
- 장점: Redis 장애에도 안전
- 단점: 구현량 증가

C를 선택했다. 이유는 at-least-once 전달의 핵심은 "실패해도 재시도한다"인데, 멱등성 레이어 자체가 단일 장애점이 되면 의미가 반감되기 때문이다. Redis가 죽어도 서비스 가드가 비즈니스 정합성을 지켜준다.

```
Event 재시도
    |
    v
 Layer 1: @EventIdempotent (Redis SETNX)
    |  +-- 99% 중복 차단
    v
 Layer 2: Service Guard (DB 조회)
    |  +-- Redis 장애/TTL 만료 시 방어
    v
  비즈니스 로직 실행
```

### Q4: 기존 @Idempotent를 수정하지 않고 새로 만들 수 있는가?

핵심 제약이 하나 있었다. 기존 HTTP 멱등성 로직(`@Idempotent` + `IdempotencyAspect`)은 프로덕션에서 동작 중이므로 일절 수정하지 않아야 했다. 새로운 `@EventIdempotent`는 실험적 적용이다.

기존 코드 변경 없이 새 파일만 추가하는 구조로 설계했다:

```
기존 (변경 없음)                   신규
  @Idempotent                     @EventIdempotent
  IdempotencyAspect (HTTP)        EventIdempotencyAspect (Event)
  IdempotencyManager  <-----------+  (재사용)
  PayloadHasher       <-----------+  (재사용)
```

Redis 키 네임스페이스도 분리했다:
```
HTTP (기존):  IDEM:ORDER:{X-Idempotency-Key}
Event (신규): EVENT_IDEM:CART_CREATE:{eventId}
              EVENT_IDEM:FUNDING_WITHDRAW:{eventId}
```

### Q5: 서비스 가드는 구체적으로 어떻게 구현하는가?

두 서비스 각각의 특성에 맞는 패턴을 적용했다.

**CartService.createCart -- find-or-create 패턴**

```java
// Before: 항상 새 카트 생성
public Cart createCart(Long memberId) {
    return cartRepositoryPort.save(Cart.create(memberId));
}

// After: 기존 카트가 있으면 반환
public Cart createCart(Long memberId) {
    return cartRepositoryPort.findByMemberId(memberId)
        .orElseGet(() -> cartRepositoryPort.save(Cart.create(memberId)));
}
```

`findByMemberId()`는 이미 `CartRepositoryPort`에 정의되어 있었다. 한 줄의 변경으로 멱등성이 확보됐다.

**WithdrawFundingUseCase -- participant 존재 확인 가드**

```java
// Before: 바로 차감
public void withdrawByWishlistItem(Long wishlistItemId, Long participantId, Money amount) {
    Funding funding = fundingRepository.findActiveByWishlistItemId(wishlistItemId)
        .orElseThrow(...);
    funding.withdraw(amount.toBigDecimalValue().intValue());
    fundingParticipantMemberRepository.deleteByFundingIdAndParticipantId(funding.getId(), participantId);
}

// After: participant 존재 확인 후 차감
public void withdrawByWishlistItem(Long wishlistItemId, Long participantId, Money amount) {
    Funding funding = fundingRepository.findActiveByWishlistItemId(wishlistItemId)
        .orElseThrow(...);

    if (!fundingParticipantMemberRepository.existsByFundingIdAndParticipantId(
            funding.getId(), participantId)) {
        return;  // 이미 삭제됨 -> 이중 차감 방지
    }

    funding.withdraw(amount.toBigDecimalValue().intValue());
    fundingParticipantMemberRepository.deleteByFundingIdAndParticipantId(funding.getId(), participantId);
}
```

`existsByFundingIdAndParticipantId()`도 이미 `FundingParticipantMemberRepository`에 있었다. 첫 번째 호출에서 participant를 삭제하면, 두 번째 호출에서는 exists가 false를 반환하여 차감을 건너뛴다.

### Q6: @EventIdempotent를 어느 모듈에 배치해야 하는가?

`@EventIdempotent` 어노테이션과 `EventIdempotencyAspect`의 모듈 배치를 고민했다.

세 가지 선택지가 있었다:
1. `support/common` — 어노테이션 + Aspect 모두
2. `support/web` — 기존 멱등성 코드 옆에
3. 새 모듈 `support/event` 생성

결론은 어노테이션은 `support/common`에 (의존성 없음), Aspect는 `support/web`에 (IdempotencyManager, PayloadHasher 재사용) 배치했다. `support/web`이 이미 Redis 의존성과 멱등성 관련 코드를 갖고 있어서, 새 모듈을 만드는 것보다 실용적이었다.

## 근본 원인

at-most-once에서 at-least-once로의 전달 보장 수준 변경이 근본 원인이다. `@TransactionalEventListener`는 실패 시 이벤트를 버리므로 중복 호출이 발생하지 않았다. `@ApplicationModuleListener`는 실패한 이벤트를 재시도하므로 중복 호출이 필연적으로 발생한다.

기존 리스너 2개(`MemberSignedEventListener`, `OrderCanceledEventListener`)가 "최대 한 번 호출된다"는 암묵적 가정 하에 작성되어 있었기 때문에 문제가 드러났다.

**Confidence: confirmed** — Spring Modulith 공식 문서에서 at-least-once 전달과 재시도 메커니즘을 명시하고 있다.

## 수정 사항

### 신규 파일 (4개)

| 파일 | 역할 |
|------|------|
| `support/common/.../annotation/EventIdempotent.java` | 이벤트 멱등성 어노테이션 (prefix, ttl) |
| `support/web/.../aop/EventIdempotencyAspect.java` | AOP Around advice (Redis SETNX 기반) |
| `support/web/.../aop/EventIdempotencyAspectTest.java` | Aspect 단위 테스트 3개 |
| `bc/core/.../WithdrawFundingUseCaseTest.java` | UseCase 단위 테스트 3개 |

### 수정 파일 (6개)

| 파일 | 변경 내용 |
|------|-----------|
| `CartService.java` | `createCart()` find-or-create 패턴 |
| `CartServiceTest.java` | 멱등성 테스트 1개 추가 |
| `WithdrawFundingUseCase.java` | participant 존재 확인 가드 |
| `MemberSignedEventListener.java` | `@EventIdempotent(prefix = "CART_CREATE")` 추가 |
| `OrderCanceledEventListener.java` | `@EventIdempotent(prefix = "FUNDING_WITHDRAW")` 추가 |
| `bc/catalog/build.gradle.kts` | support:common 의존성 추가 |

## 교훈

- 전달 보장 수준이 바뀌면 소비자 측 멱등성을 반드시 재검토해야 한다. at-most-once에서 at-least-once로의 전환은 단순한 어노테이션 교체가 아니라 비즈니스 로직의 안전성 재평가가 필요하다.
- 멱등성은 단일 레이어에 의존하면 안 된다. Redis 기반 중복 필터링은 빠르지만, Redis 장애나 TTL 만료 시 뚫린다. 서비스 레벨 가드를 defense-in-depth로 추가하면 인프라 장애에도 비즈니스 정합성을 보장할 수 있다.
- 기존 코드에 재사용 가능한 컴포넌트가 이미 있을 수 있다. "HTTP 전용"으로 보이는 인프라도 분석해보면 HTTP에 결합된 부분은 최상위 한 클래스뿐이고, 하위 컴포넌트는 범용적일 수 있다.
- 서비스 레벨 가드는 각 비즈니스 로직의 특성에 맞게 설계해야 한다. "만능 패턴"은 없다. Cart는 find-or-create, Funding은 participant 존재 확인이라는 서로 다른 패턴이 필요했다.
- TDD로 멱등성 검증을 먼저 작성하면 "현재 코드가 왜 멱등하지 않은지"가 테스트 실패 메시지로 명확해진다. `NeverWantedButInvoked`나 `UnnecessaryStubbingException` 같은 실패가 정확히 누락된 가드를 가리킨다.

## References

- [Spring Modulith API Docs - ApplicationModuleListener](https://docs.spring.io/spring-modulith/docs/current/api/org/springframework/modulith/ApplicationModuleListener.html) -- @ApplicationModuleListener는 @Async @Transactional @TransactionalEventListener의 축약이다
- [Working with Application Events - Spring Modulith](https://docs.spring.io/spring-modulith/reference/events.html) -- Event Publication Registry가 실패한 이벤트를 incomplete 상태로 유지하고 재시도한다
- [IncompleteEventPublications API](https://docs.spring.io/spring-modulith/docs/current/api/org/springframework/modulith/events/IncompleteEventPublications.html) -- IncompleteEventPublications를 통해 미완료 이벤트를 재제출할 수 있다
- [What is Idempotency in Redis? - Redis Blog](https://redis.io/blog/what-is-idempotency-in-redis/) -- Redis SET NX는 atomic하게 동작하여 두 요청 중 하나만 키를 설정할 수 있다
- [Idempotent Consumer Pattern - microservices.io](https://microservices.io/patterns/communication-style/idempotent-consumer.html) -- at-least-once 전달에서 lightweight pre-filter + DB 가드 조합이 권장된다
- [Idempotency and Ordering in Event-Driven Systems - CockroachDB](https://www.cockroachlabs.com/blog/idempotency-and-ordering-in-event-driven-systems/) -- 분산 시스템에서 중복은 불가피하며, 방지보다 graceful handling이 핵심이다
- [Idempotency - Event-driven Architecture on AWS](https://aws-samples.github.io/eda-on-aws/concepts/idempotency/) -- AWS EDA에서도 at-least-once 전달 시 consumer 측 멱등성을 강조한다
