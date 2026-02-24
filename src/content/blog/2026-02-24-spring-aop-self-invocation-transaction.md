---
title: "디버깅: Spring AOP Self-Invocation으로 인한 @Transactional 미적용"
description: 정산 실행 배치에서 @Transactional(REQUIRES_NEW)가 같은 클래스 내부
  호출(self-invocation)로 인해 무시되어, 판매자 A 정산 실패 시 판매자 B까지 롤백되는 문제가 발생했다. 트랜잭션이 필요한
  로직을 별도 Spring Bean으로 분리하여 해결했다.
pubDate: 2026-02-24
tags:
  - 디버깅
  - 개발/Spring
draft: false
---

# 디버깅: Spring AOP Self-Invocation으로 인한 @Transactional 미적용

## TL;DR

정산 실행 배치에서 `@Transactional(REQUIRES_NEW)`가 같은 클래스 내부 호출(self-invocation)로 인해 무시되어, 판매자 A 정산 실패 시 판매자 B까지 롤백되는 문제가 발생했다. 트랜잭션이 필요한 로직을 별도 Spring Bean으로 분리하여 프록시를 통한 호출이 이루어지도록 수정해 해결했다.

## 배경

Giftify 프로젝트의 정산 시스템은 Spring Batch 기반으로 동작한다. 정산 실행 배치(ExecutionJob)는 판매자별로 정산 금액을 집계하고, 각 판매자의 정산 결과를 DB에 저장한다.

핵심 요구사항은 **판매자별 트랜잭션 격리**다. 판매자 A의 정산 처리 중 오류가 발생하더라도 판매자 B의 정상 처리 결과에는 영향이 없어야 한다. 이를 위해 `@Transactional(propagation = REQUIRES_NEW)`를 사용해 각 판매자 처리를 독립 트랜잭션으로 실행하려 했다.

## 문제 상황

정산 실행 배치에서 판매자 A 정산 실패 시 판매자 B까지 롤백되는 현상이 발생했다.

```
판매자 A 정산 중 DB 오류 발생
    -> 예외 catch 후 FAILED 상태로 기록하려 했지만
    -> 판매자 B의 정상 처리 결과까지 함께 롤백됨
```

판매자별로 독립적으로 처리되어야 하는데 하나의 트랜잭션으로 묶이고 있었다.

## 원인 분석

`SettlementExecutionWriter` 안에서 직접 `@Transactional(REQUIRES_NEW)`를 선언한 것이 문제였다.

```java
// 문제 코드
public class SettlementExecutionWriter implements ItemWriter<ExecutionResult> {

    @Transactional(propagation = REQUIRES_NEW)  // <-- 적용 안 됨
    private void writeOne(ExecutionResult result) { ... }

    public void write(Chunk<ExecutionResult> chunk) {
        for (ExecutionResult result : chunk) {
            writeOne(result);  // 같은 객체 내부 호출 (this.writeOne)
        }
    }
}
```

Spring AOP는 **프록시 기반**으로 동작한다. 외부에서 Bean의 메서드를 호출하면 프록시 객체를 거치면서 `@Transactional` 같은 AOP 어노테이션이 적용된다. 하지만 같은 클래스 내부에서 `this.메서드()`로 호출하면 프록시를 거치지 않기 때문에 `@Transactional`이 완전히 무시된다.

이것이 Spring의 대표적인 함정인 **self-invocation 문제**다.

```
외부 호출:  caller -> Proxy(Bean) -> writeOne()   [O] @Transactional 적용
내부 호출:  write() -> this.writeOne()             [X] @Transactional 무시
```

결과적으로 `REQUIRES_NEW`가 동작하지 않아 모든 판매자 처리가 Spring Batch Step의 기본 트랜잭션 하나에 묶였고, 한 판매자의 예외가 전체를 롤백시킨 것이다.

## 해결

트랜잭션이 필요한 로직을 별도 Spring Bean(`SettlementExecutionService`)으로 분리했다.

**Writer -- 흐름 제어만 담당:**

```java
public class SettlementExecutionWriter implements ItemWriter<ExecutionResult> {
    private final SettlementExecutionService service; // 별도 Bean 주입

    public void write(Chunk<ExecutionResult> chunk) {
        for (ExecutionResult result : chunk) {
            try {
                service.write(result);         // 프록시 호출 -> REQUIRES_NEW 적용
            } catch (InfraException e) {
                service.markAsFailed(result);  // 프록시 호출 -> REQUIRES_NEW 적용
            } catch (Exception e) {
                service.markAsManual(result);  // 프록시 호출 -> REQUIRES_NEW 적용
            }
        }
    }
}
```

**Service -- 트랜잭션 경계만 담당:**

```java
@Service
public class SettlementExecutionService {

    @Transactional(propagation = REQUIRES_NEW)
    public void write(ExecutionResult result) { ... }

    @Transactional(propagation = REQUIRES_NEW)
    public void markAsFailed(ExecutionResult result) { ... }

    @Transactional(propagation = REQUIRES_NEW)
    public void markAsManual(ExecutionResult result) { ... }
}
```

`SettlementExecutionWriter`가 `SettlementExecutionService`를 주입받아 호출하면, Spring이 생성한 프록시 객체를 통해 호출되므로 `@Transactional(REQUIRES_NEW)`가 정상 적용된다.

### 왜 Writer 안에서 직접 쓰면 안 되는가

```java
// Writer 내부에서 직접 @Transactional(REQUIRES_NEW)를 쓰면
// Spring AOP는 프록시 기반이므로
// 같은 빈 내부 메서드 호출은 프록시를 거치지 않음
// -> @Transactional 무시됨 (self-invocation 문제)
```

별도 Spring Bean으로 분리하면 주입 시점에 프록시 객체가 할당되고, 메서드 호출 시 프록시를 통해 AOP가 정상 적용된다.

## 결과

```
판매자 A 정산 실패 -> markAsFailed() (독립 트랜잭션 -> FAILED 기록 후 커밋)
판매자 B 정산 성공 -> write()        (독립 트랜잭션 -> COMPLETED 기록 후 커밋)
```

A의 실패가 B에 영향을 주지 않는다. 부분 실패가 허용되는 구조가 완성되었다.

**에러 처리 분기:**

| 예외 유형 | 처리 | 다음 배치 |
|-----------|------|-----------|
| `InfraException` (retryable) | `markAsFailed()` | 재시도 대상 |
| 기타 예외 | `markAsManual()` | 수동 처리 대상 |
| 정상 | `write()` | COMPLETED |

## 교훈

- `@Transactional`은 Spring Bean 간 호출에서만 동작한다. 같은 클래스 내부 호출(self-invocation)에서는 AOP 프록시를 거치지 않아 어노테이션이 무시된다.
- 트랜잭션 경계가 필요한 로직은 반드시 별도 Bean으로 분리해야 한다. Writer는 흐름 제어만, Service는 트랜잭션 경계만 담당하도록 책임을 나누는 것이 명확하다.
- 이 패턴은 정산뿐 아니라, 배치 처리에서 건별 독립 트랜잭션이 필요한 모든 상황에 동일하게 적용할 수 있다.

### 발표 가치 판단

| 항목 | 내용 |
|------|------|
| 기술 깊이 | Spring AOP self-invocation 문제를 알고 의도적으로 설계 |
| 실제 효과 | 판매자 단위 트랜잭션 격리 -- 부분 실패 허용 |
| 한 줄 설명 | "Writer 내부에서 REQUIRES_NEW를 쓰면 self-invocation으로 무시되기 때문에, 트랜잭션이 필요한 로직을 별도 Service Bean으로 분리했습니다" |
