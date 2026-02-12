---
title: JPA, 도메인 이벤트, 그리고 `pullEvents → save → publish` 순서를 이해하기까지
description: “왜  `pullEvents → save → publish` 순서를 지켜야 하지?”
pubDate: 2026-02-12
updatedDate: 2026-02-12
tags: []
draft: false
---

실제 코드에서 도메인 이벤트를 다루다가 “왜 꼭 `pullEvents → save → publish` 순서를 지켜야 하지?”라는 의문이 들었고, 그걸 파고들다 보니 JPA, 도메인 모델, 스프링의 이벤트 기능까지 한 번에 정리하게 되었습니다. 이 글은 그 과정을 **트러블슈팅 스토리** 형식으로 정리한 것입니다.

- 문제를 처음 어떻게 인식했는지
- 왜 `save → publish`가 아닌지
- JPA와 도메인 이벤트를 “더 잘” 결합할 수는 없는지
- 스프링의 `@DomainEvents`를 섞어 쓰면 어떨지

질문과 답변이 이어지는 흐름 그대로 따라가며 설명합니다.


## 1. 출발점: 왜 `pullEvents → save → publish`여야 하지?

처음 문제의식은 여기서 출발했습니다.

> pullEvents → save → publish 순서의 이유가 뭔가요?

이미 코드에는 이런 순서가 자리 잡고 있었지만, “감으로” 쓰기는 싫었습니다.  
그래서 먼저 `pullEvents()`가 정확히 무슨 일을 하는지부터 짚고 넘어갔습니다.

### 1-1. `pullEvents()`는 단순 getter가 아니다

도메인 모델의 기반이 되는 `BaseDomainModel`에는 대략 이런 구조가 있습니다.

```java
class BaseDomainModel {
    private List<DomainEvent> events = new ArrayList<>();

    protected void registerEvent(DomainEvent event) {
        events.add(event);
    }

    public List<DomainEvent> pullEvents() {
        var copied = new ArrayList<>(events);
        events.clear();              // ★ 여기서 내부 리스트를 비움
        return copied;
    }
}
```

핵심은 두 가지입니다.

- `registerEvent()`로 도메인 객체 내부에 이벤트를 쌓아 둔다.
- `pullEvents()`를 호출하면:
  - 지금까지 쌓인 이벤트들을 반환하고
  - **내부 리스트는 비운다.**

즉, `pullEvents()`는 **“읽기 전용 getter”가 아니라,  
“이벤트를 꺼내 가고, 그 자리는 초기화하는 동작”**입니다.

따라서 **언제, 어느 객체에서** `pullEvents()`를 호출하느냐가 중요해집니다.  
여기에 JPA 엔티티 ↔ 도메인 객체 변환이 끼어들면서 문제가 복잡해졌습니다.


## 2. 문제의 핵심: save 과정에서 이벤트가 사라진다

다음으로 봐야 했던 것은 `paymentRepository.save(payment)`의 내부 동작이었습니다.

현재 구조는 대략 이렇게 되어 있습니다.

1. 도메인 모델: `Payment` — 순수 POJO
2. JPA 엔티티: `JpaPayment`
3. 저장 흐름:

```text
Payment (도메인)
  └─ JpaPayment.from(payment)
        ↓
    JpaPayment (JPA 엔티티)
        ↓ JPA 저장 (persist/merge)
    DB
        ↓
  JpaPayment.toDomain()
        ↓
새로운 Payment (도메인)
```

이 과정에서 중요한 점은:

- **도메인 이벤트는 JPA 엔티티에 매핑되지 않는다.**
- `JpaPayment.toDomain()`은 builder로 **새로운 Payment 인스턴스**를 만든다.
- 새로 만들어진 이 Payment의 이벤트 리스트는 **빈 상태**다.

즉, `save()`는 “원래 Payment 인스턴스를 DB에 반영하고 그대로 돌려주는 함수”가 아니라,  
“JPA 엔티티를 거쳐 새 Payment를 만들어 돌려주는 함수”에 가깝습니다.

이제 이 사실을 바탕으로, 여러 순서를 시뮬레이션해 보게 됩니다.


## 3. 첫 실험: `save → pullEvents → publish`는 왜 위험한가?

가장 먼저 떠오를 수 있는 순서는 이겁니다.

```java
Payment savedPayment = paymentRepository.save(payment);  // (1)
var domainEvents = payment.pullEvents();                 // (2)
domainEvents.forEach(eventPublisher::publish);           // (3)
```

코드만 보면 “괜찮아 보이는데?” 싶습니다.  
하지만 실제로는 두 가지 측면에서 위험 요소가 있습니다.

### 3-1. 서로 다른 Payment 인스턴스들

한 줄씩 뜯어보면:

1. `(1)` `paymentRepository.save(payment)`  
   - 내부에서 `JpaPayment.from(payment)` → JPA 저장 → `toDomain()`을 거쳐  
     **새로운 Payment 인스턴스**인 `savedPayment`를 반환합니다.
   - 원래 `payment`는 JPA가 관리하지 않는, **detached 객체**가 될 수도 있습니다.

2. `(2)` `payment.pullEvents()`  
   - 여기서 이벤트를 꺼내는 대상은 `savedPayment`가 아니라 **원본 payment**입니다.
   - detached일 수도 있는, JPA 관점에서는 이미 떨어져 나간 객체에서 이벤트를 꺼냅니다.

즉, 이 패턴은 “저장된 최신 Aggregate”가 아니라  
**“옛날 객체에서 이벤트를 꺼내 발행하는 것”**과 비슷한 형태가 될 수 있습니다.

게다가 JPA 구현과 `save()` 내부 구현 (merge 사용 여부 등)에 강하게 의존합니다.  
“지금은 운 좋게 돌아가도, 구현이 바뀌면 깨질 수 있는” 코드가 되는 셈입니다.

### 3-2. `savedPayment`에서 이벤트를 꺼내면?

그럼 이렇게 하면 어떨까요?

```java
Payment savedPayment = paymentRepository.save(payment);
savedPayment.pullEvents().forEach(eventPublisher::publish);
```

겉으로는 더 “정상적”으로 보입니다.  
하지만, 아까 봤듯이 `savedPayment`는 새로 만들어진 도메인 객체이고,  
그 이벤트 리스트는 **빈 상태**입니다.

결과적으로:

- `savedPayment.pullEvents()`는 빈 리스트를 반환하고,
- 이벤트는 **아예 발행되지 않습니다.**

즉, 이 경우는 **조용히 실패**합니다.  
에러도 안 나고, 이벤트도 안 나갑니다.


## 4. 두 번째 실험: `pullEvents → publish → save`는 왜 안 되는가?

다음으로 떠올릴 수 있는 순서는 이것입니다.

```java
var domainEvents = payment.pullEvents();
domainEvents.forEach(eventPublisher::publish);  // DB 저장 전에 발행
paymentRepository.save(payment);                // 이게 실패하면?
```

이 순서는 이벤트 유실 문제는 해결해 줍니다.

- `pullEvents()`를 가장 먼저 호출해 원본 Payment에서 이벤트를 꺼내오니
- JPA 엔티티 변환 과정에서 이벤트가 사라져도 상관 없습니다.

하지만 더 치명적인 문제가 있습니다.

> **“DB 저장이 성공했는지 확인도 안 하고 이벤트를 발행한다”**는 점입니다.

상황을 상상해 보면:

1. `pullEvents()`로 `[결제 완료]` 이벤트를 꺼내고,
2. `publish()`에서 리스너들이 주문 상태를 바꾸고, 이메일을 보내고, 포인트를 적립합니다.
3. 그 다음 `save()`에서 DB 예외가 납니다.

그러면 시스템 상태는 이렇게 됩니다.

- 외부 시스템: “결제 완료”라고 믿고 움직이기 시작했다.
- 실제 DB: 결제 row 자체가 없거나, 롤백되었다.

결과적으로 **심각한 데이터 불일치**가 발생합니다.  
이건 보통 도메인 이벤트 설계에서 가장 피하고 싶은 상황입니다.


## 5. 최종 결론: `pullEvents → save → publish`가 그나마 안전한 이유

위의 실험들을 통해 **두 가지는 확실해졌습니다.**

1. `save()` 이후에 이벤트를 꺼내려 하면, 지금 구조에서는 사실상 불가능하다.
   - 새 Payment 인스턴스에는 이벤트가 없기 때문.
2. `save()` 이전에 이벤트를 발행해 버리면, DB 실패 시 롤백 불가능한 불일치가 생긴다.

그래서 다음 순서가 남습니다.

```java
var domainEvents = payment.pullEvents();  // (1)
paymentRepository.save(payment);         // (2)
domainEvents.forEach(eventPublisher::publish); // (3)
```

의미를 다시 정리해 보면:

- (1) `pullEvents()`
  - **원본 도메인 객체**에서 이벤트를 꺼낸다.
  - 이 시점에는 Payment 내부 상태와 이벤트가 서로 일관된 상태다.
  - 리스트를 비우지만, 이벤트는 `domainEvents` 변수에 안전하게 보관한다.

- (2) `save()`
  - `JpaPayment.from(payment)` → JPA 저장 → `toDomain()` 순으로 DB에 반영.
  - 이 과정에서 이벤트는 JPA 엔티티에 매핑되지 않고 사라지지만,
  - 우리는 이미 (1)에서 별도의 리스트로 확보했으므로 상관 없다.

- (3) `publish()`
  - **DB 저장이 성공한 후에만** 이벤트를 발행한다.
  - `save()`에서 예외가 나면 (3)까지 도달하지 못하고, 이벤트도 발행되지 않는다.

즉, `pullEvents → save → publish` 순서는:

- 이벤트 유실을 막으면서
- DB 실패 시 이벤트가 먼저 나가버리는 문제도 피하는  
**“현재 구조에서 가능한 가장 안전한 타협”**입니다.


## 6. 그럼 JPA와 도메인 이벤트를 더 잘 결합할 수는 없을까?

여기서 자연스럽게 다음 질문이 나왔습니다.

> “JPA와 도메인 이벤트를 결합하는 기능은 없나요?  
> 지금은 도메인 모델이 순수 POJO라서 사용하기 어려운 거구요?”

이 질문은 두 층위가 있습니다.

1. **JPA 스펙 자체에 도메인 이벤트 통합 기능이 있나?**  
2. **지금처럼 도메인과 JPA를 분리해 놓은 구조에서 더 나은 방법은 없나?**

### 6-1. JPA 스펙: 도메인 이벤트를 모른다

JPA 자체는 도메인 이벤트 개념을 거의 모릅니다.

- 제공하는 건 `@PrePersist`, `@PostPersist`, `@PostUpdate` 같은 **엔티티 라이프사이클 콜백**뿐이고,
- “도메인 이벤트 리스트를 모아서 커밋 이후에 발행해준다” 같은 기능은 없습니다.

즉, **JPA 단독으로는 도메인 이벤트를 “알아서 처리해주는” 기능이 없다**고 보는 게 맞습니다.

도메인 이벤트를 JPA와 엮고 싶다면, 결국:

- 직접 패턴을 짜거나
- 스프링 같은 프레임워크의 추가 기능을 써야 합니다.


### 6-2. 도메인 = JPA 엔티티로 두는 방식

한 가지 극단은 아예 이렇게 가는 것입니다.

- `Payment` 도메인 = `@Entity` JPA 엔티티
- 엔티티 내부에 이벤트 리스트를 두고
- 엔티티에서 비즈니스 로직과 이벤트 등록을 다 처리

예를 들면:

```java
@Entity
class Payment {

    @Id
    private Long id;

    @Transient
    private List<DomainEvent> events = new ArrayList<>();

    public void complete() {
        // 비즈니스 로직
        events.add(new PaymentCompletedEvent(id));
    }

    public List<DomainEvent> pullEvents() {
        var copy = new ArrayList<>(events);
        events.clear();
        return copy;
    }
}
```

그리고 하이버네이트 이벤트 리스너나 스프링 Data JPA의 `@DomainEvents`를 이용해  
save 시점에 이벤트를 발행할 수 있습니다.

이 방식은:

- **JPA와 도메인 이벤트 결합은 쉬워지지만**
- 도메인 모델이 JPA에 강하게 묶이고,
- 순수 POJO, 클린 아키텍처와는 거리가 멉니다.

그래서 “구현 편의성 vs 도메인 순수성” 사이에서 선택해야 합니다.


## 7. 추가 질문: 그럼 `@DomainEvents`를 JpaEntity에만 쓰고, 도메인은 POJO로 두면?

여기서 더 나아가 이런 아이디어가 나왔습니다.

> 스프링의 `@DomainEvents` / `@AfterDomainEventPublication`을 JpaEntity에서 사용하고,  
> 도메인은 POJO로 두되, 도메인 이벤트를 담아서 JPA 엔티티로 변환하면 어떤가?

즉, 구체적인 상상은 이렇습니다.

1. 도메인 `Payment`는 순수 POJO로 유지.
2. `JpaPayment` JPA 엔티티에는 `@DomainEvents`, `@AfterDomainEventPublication`을 붙인다.
3. `JpaPayment.from(payment)` 할 때:
   - 도메인 `payment.pullEvents()`로 이벤트를 꺼내,
   - 그 이벤트를 `JpaPayment`의 transient 리스트에 담는다.
4. Spring Data JPA의 `save()` 과정에서:
   - `@DomainEvents`가 호출되어 이벤트를 발행한다.
   - 이후 `@AfterDomainEventPublication`에서 리스트를 비운다.

코드로 그려보면 대략 이런 그림입니다.

```java
// 도메인
class Payment {
    private List<DomainEvent> events = new ArrayList<>();

    void complete() {
        events.add(new PaymentCompletedEvent(id));
    }

    List<DomainEvent> pullEvents() {
        var copy = new ArrayList<>(events);
        events.clear();
        return copy;
    }
}
```

```java
// JPA 엔티티
@Entity
class JpaPayment {

    @Id
    private Long id;

    @Transient
    private List<Object> domainEvents = new ArrayList<>();

    static JpaPayment from(Payment payment) {
        var jpa = new JpaPayment();
        jpa.id = payment.getId();
        // ... 기타 값 매핑

        // ★ 도메인에서 이벤트를 가져와 JPA 엔티티에 싣는다
        jpa.domainEvents.addAll(payment.pullEvents());

        return jpa;
    }

    @DomainEvents
    public Collection<Object> domainEvents() {
        return Collections.unmodifiableList(domainEvents);
    }

    @AfterDomainEventPublication
    public void clearDomainEvents() {
        domainEvents.clear();
    }

    Payment toDomain() {
        return new Payment(/* ... */);
    }
}
```

```java
// 리포지토리 어댑터
class PaymentRepositoryImpl implements PaymentRepository {

    private final PaymentJpaRepository jpaRepo;

    @Override
    public Payment save(Payment payment) {
        var jpa = JpaPayment.from(payment);   // 여기서 이벤트가 JPA로 옮겨간다
        var savedJpa = jpaRepo.save(jpa);     // save 중에 @DomainEvents 작동
        return savedJpa.toDomain();
    }
}
```

### 7-1. 이 방식의 의미

이렇게 하면:

- 도메인은 여전히 순수 POJO로 남고,
- `pullEvents()` 호출 시점은 리포지토리 어댑터 내부(`from(payment)`)로 감춰지며,
- 이벤트 발행 트리거는 Spring Data JPA의 `save()`와 묶입니다.

겉으로 보면 꽤 “우아해 보이는 타협”처럼 느껴질 수 있습니다.

### 7-2. 하지만 실제로는…

구현 가능성 자체는 **충분히 있습니다**.  
다만 몇 가지 한계와 미묘한 점이 남습니다.

1. **본질적으로 여전히 “save 전에 pullEvents” 패턴이다**  
   - `payment.pullEvents()`를 서비스 코드가 아니라 `JpaPayment.from(payment)` 안에서 호출할 뿐입니다.
   - 순서 규칙이 사라진 게 아니라, **레이어 안쪽으로 숨겨졌을 뿐**입니다.

2. **`@DomainEvents`는 스프링 애플리케이션 이벤트일 뿐**  
   - ApplicationContext 내부에서만 소비되는 이벤트이고,
   - Kafka, RabbitMQ 같은 외부 시스템과의 일관성, 재시도, Outbox 패턴을 자동으로 해결해 주지는 않습니다.
   - 결국 “진짜” 도메인 이벤트 인프라를 만들려면 한 단계 더 필요합니다.

3. **이벤트 라이프사이클이 여러 레이어에 흩어진다**  
   - 생성: 도메인 (Payment)
   - 운반: JPA 엔티티 (JpaPayment)
   - 발행: Spring Data / ApplicationEventPublisher
   - 후처리: (필요하다면) @TransactionalEventListener(AFTER_COMMIT)

   이벤트가 한 레이어에 모여 있지 않고,  
   “도메인 → 인프라 어댑터 → 프레임워크”를 오가며 분산되는 구조가 됩니다.

4. **테스트와 가독성 복잡도 증가**  
   - “save 시 어떤 이벤트가 발행되는지”를 이해하려면,
     - 도메인 코드
     - JPA 매핑 코드 (`from`)
     - 스프링 데이터 JPA, ApplicationEvent, TransactionalEventListener
   - 를 모두 따라가야 합니다.

종합적으로 보면:

- “가능하냐?” → **가능하다.**
- “깔끔하냐?” → **도메인 순수성을 지키면서도 JPA와 자연스럽게 통합되는 ‘완벽한’ 해법은 아니다.**  
  차라리 두 극단 중 하나를 고르는 편이 낫습니다.

- JPA 엔티티 = Aggregate Root로 받아들이고, 거기에 이벤트/로직을 몰아넣거나
- 아니면 지금처럼 도메인은 완전히 JPA 밖에 두고,  
  `pullEvents → save → publish` 혹은 Transactional Outbox로 **명시적으로** 처리하거나.


## 8. 마무리: 내가 얻은 결론

질문과 실험을 계속 반복한 끝에, 개인적으로 이렇게 정리할 수 있었습니다.

1. **현재 구조(순수 도메인 + JPA 어댑터)에서는**  
   - `pullEvents → save → publish` 순서가 “이벤트 유실”과 “DB 실패 후 이벤트 발행”을 모두 피하는 가장 합리적인 선택이다.

2. **JPA 자체는 도메인 이벤트를 제대로 모르는 레이어**이고,  
   - 진짜 문제 해결은 Outbox, `@TransactionalEventListener(AFTER_COMMIT)` 같은 패턴에서 이뤄진다.

3. **`@DomainEvents`를 JpaEntity에다만 쓰고, 도메인은 POJO로 두는 혼합 방식은**  
   - 구현은 가능하지만,
   - 결국 “save 전에 pullEvents”란 본질은 그대로고,
   - 이벤트 라이프사이클이 레이어를 가로질러 퍼져서 오히려 복잡해질 수 있다.

정리해 보면, 이 문제는 단순히 “메서드 순서”의 문제가 아니라:

- 도메인 모델을 어디까지 순수하게 둘 것인지,
- JPA를 도메인의 일부로 받아들일 것인지,  
  아니면 인프라 어댑터로 강하게 분리할 것인지,
- 트랜잭션과 이벤트 발행을 어떤 패턴으로 엮을 것인지

에 대한 **아키텍처적인 선택**의 문제였습니다.

그리고 그 선택의 결과가 **“지금은 `pullEvents → save → publish`가 맞다”**는 결론으로 이어졌습니다.
