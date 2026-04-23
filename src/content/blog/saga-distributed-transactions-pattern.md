---
title: "Saga 분산 트랜잭션 패턴"
description: "Saga 디자인 패턴은 분산 시스템에서 여러 서비스에 걸친 트랜잭션을 조율하여 데이터 일관성을 유지하는 패턴이다. 트랜잭션을 일련의 로컬 트랜잭션으로 분해하고, 실패 시 보상 트랜잭션을 통해 롤백하는 방식을 제공한다. 구현 방식으로는 코레오그래피와 오케스트레이션 두 가지 접근법이 있다."
pubDate: "2026-03-03"
tags: ["Resources/translations/tech-blog", "Areas/architecture", "Areas/software/design-pattern"]
contentSource: "ai-generated"
series: "클라우드 디자인 패턴"
seriesOrder: 1
draft: false
---

> 원문: [Saga distributed transactions pattern - Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga)

## 1. Highlights / Summary

Saga 디자인 패턴(Saga design pattern)은 분산 시스템(distributed systems)에서 여러 서비스에 걸친 트랜잭션(transaction)을 조율하여 데이터 일관성(data consistency)을 유지하는 패턴입니다. Saga는 일련의 로컬 트랜잭션(local transactions)으로 구성되며, 각 서비스가 자체 작업을 수행하고 이벤트(event)나 메시지(message)를 통해 다음 단계를 트리거합니다. 시퀀스 중 한 단계가 실패하면, Saga는 보상 트랜잭션(compensating transactions)을 수행하여 이전에 완료된 단계들을 되돌립니다.

마이크로서비스 아키텍처(microservices architecture)에서는 각 마이크로서비스가 전용 데이터베이스(database-per-microservice)를 사용하기 때문에, 전통적인 ACID 보장이 여러 독립적인 데이터 저장소에 직접 적용되기 어렵습니다. Saga 패턴은 이러한 한계를 극복하기 위해 트랜잭션을 일련의 로컬 트랜잭션으로 분해하고, 실패 시 보상 트랜잭션을 통해 롤백(rollback)하는 방식을 제공합니다. 구현 방식으로는 코레오그래피(choreography)와 오케스트레이션(orchestration) 두 가지 접근법이 있습니다.

---

## 2. Detailed Summary

### 2.1 Context and Problem — 컨텍스트와 문제

트랜잭션(transaction)은 여러 작업을 포함할 수 있는 하나의 작업 단위(unit of work)를 의미합니다. 트랜잭션 내에서 이벤트(event)는 엔터티에 영향을 미치는 상태 변경을 나타내고, 커맨드(command)는 액션을 수행하거나 후속 이벤트를 트리거하는 데 필요한 모든 정보를 캡슐화합니다.

트랜잭션은 **ACID** 원칙을 준수해야 한다:

- **원자성(Atomicity)**: 모든 작업이 성공하거나, 아무 작업도 수행되지 않습니다
- **일관성(Consistency)**: 데이터가 하나의 유효한 상태에서 다른 유효한 상태로 전이됩니다
- **격리성(Isolation)**: 동시 트랜잭션이 순차적 트랜잭션과 동일한 결과를 산출합니다
- **지속성(Durability)**: 커밋된 변경사항은 장애가 발생하더라도 유지됩니다

단일 서비스 내에서는 단일 데이터베이스 내에서 동작하므로 ACID 원칙을 따르지만, **여러 서비스에 걸친 ACID 준수는 훨씬 복잡**합니다.

#### 마이크로서비스 아키텍처에서의 과제

마이크로서비스 아키텍처는 일반적으로 각 마이크로서비스에 전용 데이터베이스(dedicated database)를 할당합니다. 이 접근 방식은 다음과 같은 이점을 제공합니다:

- 각 서비스가 자체 데이터를 캡슐화(encapsulate)
- 각 서비스가 고유한 요구에 가장 적합한 데이터베이스 기술과 스키마(schema) 사용 가능
- 각 서비스의 데이터베이스를 독립적으로 확장(scale) 가능
- 한 서비스의 장애가 다른 서비스로부터 격리(isolate)

그러나 이 아키텍처는 **서비스 간 데이터 일관성(cross-service data consistency)**을 복잡하게 만듭니다. 전통적인 데이터베이스 보장(ACID)은 여러 독립적으로 관리되는 데이터 저장소에 직접 적용할 수 없습니다. 이러한 한계 때문에, 프로세스 간 통신(interprocess communication)이나 2단계 커밋 프로토콜(two-phase commit protocol) 같은 전통적 트랜잭션 모델에 의존하는 아키텍처가 Saga 패턴에 더 적합한 경우가 많습니다.

---

### 2.2 Solution — 솔루션

Saga 패턴은 트랜잭션을 **일련의 로컬 트랜잭션(local transactions)**으로 분해하여 관리합니다.

![Saga 개요 다이어그램](/images/saga-overview.png)

각 로컬 트랜잭션은:

- 단일 서비스 내에서 원자적(atomically)으로 작업을 완료합니다
- 서비스의 데이터베이스를 업데이트합니다
- 이벤트(event) 또는 메시지(message)를 통해 다음 트랜잭션을 시작합니다

로컬 트랜잭션이 실패하면, Saga는 이전 로컬 트랜잭션이 수행한 변경사항을 되돌리기 위해 일련의 **보상 트랜잭션(compensating transactions)**을 수행합니다.

#### Saga 패턴의 핵심 개념

1. **보상 가능 트랜잭션(Compensable transactions)**: 반대 효과를 가진 다른 트랜잭션에 의해 취소되거나 보상될 수 있습니다. Saga의 한 단계가 실패하면, 보상 트랜잭션이 보상 가능 트랜잭션이 만든 변경사항을 되돌립니다.

2. **피벗 트랜잭션(Pivot transactions)**: Saga에서 **돌이킬 수 없는 지점(point of no return)**의 역할을 합니다. 피벗 트랜잭션이 성공한 후에는 보상 가능 트랜잭션이 더 이상 관련이 없습니다. 후속 모든 액션은 시스템이 일관된 최종 상태에 도달하도록 완료되어야 합니다. 피벗 트랜잭션은 흐름에 따라 다양한 역할을 가질 수 있습니다:
   - **비가역 또는 비보상 트랜잭션(Irreversible or noncompensable transactions)**: 되돌리거나 재시도할 수 없습니다
   - **가역과 커밋 사이의 경계(Boundary between reversible and committed)**: 마지막 되돌릴 수 있는 트랜잭션이거나, Saga에서 첫 번째 재시도 가능한 작업일 수 있습니다

3. **재시도 가능 트랜잭션(Retryable transactions)**: 피벗 트랜잭션 이후에 발생합니다. 멱등적(idempotent)이며, 일시적 장애가 발생하더라도 Saga가 최종 상태에 도달할 수 있도록 보장합니다.

---

### 2.3 Saga 구현 접근법

#### 코레오그래피(Choreography)

코레오그래피 접근법에서는 서비스들이 **중앙 컨트롤러 없이(without a centralized controller)** 이벤트를 교환합니다. 각 로컬 트랜잭션이 도메인 이벤트(domain events)를 발행(publish)하고, 이 이벤트가 다른 서비스의 로컬 트랜잭션을 트리거합니다.

![코레오그래피를 사용한 Saga 다이어그램](/images/choreography-pattern.png)

| 코레오그래피의 장점 | 코레오그래피의 단점 |
|---|---|
| 소수의 서비스로 구성된 단순한 워크플로우에 적합하며, 조율 로직이 필요 없다 | 새 단계를 추가할 때 워크플로우가 혼란스러워질 수 있다. 각 Saga 참여자가 어떤 커맨드에 응답하는지 추적하기 어렵다 |
| 조율을 위한 별도 서비스가 필요 없다 | Saga 참여자들이 서로의 커맨드를 소비해야 하므로 순환 의존성(cyclic dependency)의 위험이 있다 |
| 책임이 Saga 참여자들에게 분산되므로 단일 장애 지점(single point of failure)을 도입하지 않는다 | 트랜잭션을 시뮬레이션하기 위해 모든 서비스가 실행되어야 하므로 통합 테스트(integration testing)가 어렵다 |

#### 오케스트레이션(Orchestration)

오케스트레이션에서는 중앙 컨트롤러, 즉 **오케스트레이터(orchestrator)**가 모든 트랜잭션을 처리하고 이벤트에 기반하여 참여자에게 어떤 작업을 수행할지 지시합니다. 오케스트레이터는 Saga 요청을 수행하고, 각 태스크의 상태를 저장 및 해석하며, 보상 트랜잭션을 사용하여 장애 복구를 처리합니다.

![오케스트레이션을 사용한 Saga 다이어그램](/images/orchestrator.png)

| 오케스트레이션의 장점 | 오케스트레이션의 단점 |
|---|---|
| 복잡한 워크플로우나 새 서비스를 추가할 때 더 적합하다 | 조율 로직 구현이 추가적인 설계 복잡성을 요구한다 |
| 오케스트레이터가 흐름을 관리하므로 순환 의존성을 방지한다 | 오케스트레이터가 전체 워크플로우를 관리하므로 장애 지점(point of failure)이 될 수 있다 |
| 명확한 책임 분리(separation of responsibilities)가 서비스 로직을 단순화한다 | |

---

### 2.4 Problems and Considerations — 문제와 고려사항

Saga 패턴을 구현할 때 고려해야 할 사항:

- **설계 사고의 전환(Shift in design thinking)**: 트랜잭션 조율과 여러 마이크로서비스 간 데이터 일관성에 초점을 맞추는 다른 마인드셋이 필요합니다
- **Saga 디버깅의 복잡성(Complexity of debugging)**: 참여하는 서비스 수가 증가할수록 디버깅이 복잡해집니다
- **비가역적 로컬 데이터베이스 변경(Irreversible local database changes)**: Saga 참여자들이 각자의 데이터베이스에 변경사항을 커밋하므로 데이터를 롤백할 수 없습니다
- **일시적 장애 처리와 멱등성(Handling transient failures and idempotence)**: 시스템이 일시적 장애를 효과적으로 처리하고, 동일한 작업을 반복해도 결과가 달라지지 않는 멱등성을 보장해야 합니다
- **모니터링 및 추적의 필요성(Need for monitoring and tracking)**: Saga의 워크플로우를 모니터링하고 추적하는 것이 운영 감시를 유지하는 데 필수적입니다
- **보상 트랜잭션의 한계(Limitations of compensating transactions)**: 보상 트랜잭션이 항상 성공하지 않을 수 있으며, 이는 시스템을 비일관된 상태로 남겨둘 수 있습니다

#### Saga에서의 잠재적 데이터 이상 현상(Data Anomalies)

Saga가 여러 서비스에 걸쳐 동작할 때 데이터 이상 현상이 발생할 수 있습니다. 각 서비스가 자체 데이터(participant data)를 관리하므로 서비스 간 내장된 격리(built-in isolation)가 없습니다:

- **갱신 분실(Lost updates)**: 한 Saga가 다른 Saga의 변경사항을 고려하지 않고 데이터를 수정하면, 덮어쓰기 또는 누락된 업데이트가 발생
- **더티 리드(Dirty reads)**: Saga 또는 트랜잭션이 다른 Saga가 수정했지만 아직 완료되지 않은 데이터를 읽는 경우
- **퍼지 또는 비반복적 리드(Fuzzy/nonrepeatable reads)**: Saga의 서로 다른 단계가 읽기 사이에 업데이트가 발생하여 일관되지 않은 데이터를 읽는 경우

#### 데이터 이상 현상 대응 전략

- **시맨틱 락(Semantic lock)**: Saga의 보상 가능 트랜잭션이 업데이트가 진행 중임을 나타내기 위해 세마포어(semaphore)를 사용하는 애플리케이션 수준의 잠금
- **교환적 업데이트(Commutative updates)**: 어떤 순서로든 적용해도 동일한 결과를 산출하도록 업데이트를 설계하여 Saga 간 충돌을 줄입니다
- **비관적 뷰(Pessimistic view)**: 데이터 업데이트가 재시도 가능한 트랜잭션에서 발생하도록 Saga의 순서를 재배치하여 더티 리드를 제거합니다
- **값 재읽기(Reread values)**: 업데이트 전에 데이터가 변경되지 않았는지 확인하고, 데이터가 변경되었으면 현재 단계를 중단하고 필요에 따라 Saga를 재시작합니다
- **버전 파일(Version files)**: 레코드에 수행된 모든 작업의 로그를 유지하고, 충돌 방지를 위해 올바른 순서로 수행되도록 보장합니다
- **가치 기반 위험 동시성(Risk-based concurrency based on value)**: 잠재적 비즈니스 위험에 따라 적절한 동시성 메커니즘을 동적으로 선택합니다. 예: 저위험 업데이트에는 Saga, 고위험 업데이트에는 분산 트랜잭션 사용

---

### 2.5 When to Use This Pattern — 이 패턴을 사용할 시점

**적합한 경우:**

- 긴밀한 결합(tight coupling) 없이 분산 시스템에서 데이터 일관성을 보장해야 할 때
- 시퀀스 중 하나의 작업이 실패하면 롤백하거나 보상해야 할 때

**적합하지 않은 경우:**

- 트랜잭션이 긴밀하게 결합된 경우
- 이전 참여자에서 보상 트랜잭션이 발생하는 경우
- 순환 의존성이 있는 경우

---

### 2.6 Related Resources — 관련 리소스

Saga 패턴 구현 시 관련될 수 있는 패턴들:

- **Choreography 패턴**: 중앙 제어 지점 대신 시스템의 각 컴포넌트가 비즈니스 트랜잭션 워크플로우에 대한 의사결정에 참여합니다
- **Compensating Transaction 패턴**: 일련의 단계에서 수행한 작업을 되돌리며, 하나 이상의 단계가 실패할 경우 최종적 일관성 모델(eventual consistency model)을 따르는 일관된 작업을 정의합니다
- **Retry 패턴**: 서비스나 네트워크 리소스 연결 시 일시적 장애를 투명하게 재시도하여 애플리케이션의 안정성을 향상시킵니다
- **Circuit Breaker 패턴**: 원격 서비스나 리소스에 연결할 때 복구에 가변적인 시간이 걸리는 장애를 처리하여 안정성과 복원력을 향상시킵니다
- **Health Endpoint Monitoring 패턴**: 노출된 엔드포인트를 통해 정기적으로 접근 가능한 기능 검사를 애플리케이션에 구현합니다

---

## 3. Conclusion and Personal View

1. Saga 패턴은 마이크로서비스 아키텍처에서 **분산 트랜잭션의 ACID 보장 한계**를 극복하기 위한 핵심 패턴입니다.

2. 트랜잭션을 로컬 트랜잭션의 시퀀스로 분해하고, 실패 시 **보상 트랜잭션**으로 롤백하는 접근 방식은 최종적 일관성(eventual consistency)을 달성하는 실용적인 방법입니다.

3. **피벗 트랜잭션(pivot transaction)** 개념은 Saga에서 돌이킬 수 없는 지점을 명확히 정의하여, 보상 가능 트랜잭션과 재시도 가능 트랜잭션을 구분하는 중요한 설계 결정입니다.

4. 코레오그래피와 오케스트레이션의 **트레이드오프(trade-off)**를 이해하는 것이 핵심입니다. 단순한 플로우에는 코레오그래피, 복잡한 워크플로우에는 오케스트레이션이 적합합니다.

5. 데이터 이상 현상(lost updates, dirty reads, fuzzy reads)은 분산 트랜잭션에서 **불가피한 부산물**이며, 시맨틱 락, 교환적 업데이트, 비관적 뷰 등의 대응 전략이 필수적입니다.

6. 보상 트랜잭션이 **항상 성공하는 것은 아니라는 점**은 실무에서 매우 중요한 고려사항입니다. 이를 위해 재시도 메커니즘과 수동 개입 절차를 함께 설계해야 합니다.

7. Spring Modulith의 `@ApplicationModuleListener`와 Event Publication Registry 같은 프레임워크 지원은 Saga 패턴 구현의 복잡성을 상당히 줄여줄 수 있습니다.

8. Saga 패턴은 DDD의 바운디드 컨텍스트(Bounded Context) 간 통신 패턴과 자연스럽게 결합되며, 도메인 이벤트(Domain Event)를 통한 느슨한 결합을 실현합니다.

9. 실무에서는 **멱등성(idempotence) 보장**이 Saga 패턴 성공의 가장 중요한 전제 조건입니다. 이벤트 중복 처리나 재시도 시나리오에서 시스템의 일관성을 유지하려면 모든 참여자의 작업이 멱등적이어야 합니다.

10. 모니터링과 추적(observability)은 Saga 패턴 운영의 필수 요소로, 분산 트레이싱(distributed tracing)과 로그 집계를 통해 복잡한 Saga 흐름의 상태를 파악할 수 있어야 합니다.
