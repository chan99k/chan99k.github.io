---
title: "Circuit Breaker Pattern"
description: "서킷 브레이커 패턴은 원격 서비스나 리소스에 연결할 때 복구에 다양한 시간이 걸리는 장애를 처리하는 안정성 패턴이다. 장애를 감지한 후 결함이 있는 서비스에 대한 접근을 일시적으로 차단함으로써, 반복적인 실패 시도를 방지하고 시스템이 효과적으로 복구될 수 있도록 한다."
pubDate: "2026-03-05"
tags: ["Areas/architecture", "Areas/software/design-pattern", "Resources/translations/tech-blog"]
contentSource: "ai-generated"
draft: false
---

# Circuit Breaker Pattern

> 원문: [Circuit Breaker Pattern - Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker)

## 1. Highlights / Summary

서킷 브레이커 패턴(Circuit Breaker Pattern)은 원격 서비스(remote service)나 리소스에 연결할 때 복구에 다양한 시간이 걸리는 장애(fault)를 처리하는 데 도움을 주는 안정성 패턴이다. 장애를 감지한 후 결함이 있는 서비스에 대한 접근을 일시적으로 차단함으로써, 반복적인 실패 시도를 방지하고 시스템이 효과적으로 복구될 수 있도록 한다. 이 패턴은 애플리케이션의 안정성(stability)과 복원력(resiliency)을 향상시킨다.

서킷 브레이커는 전기 회로 차단기(electrical circuit breaker)의 기능을 모방한 상태 머신(state machine)으로 구현되며, **Closed**, **Open**, **Half-Open**의 세 가지 상태를 가진다. Closed 상태에서는 요청이 정상적으로 전달되고, 실패 횟수가 임계값(threshold)을 초과하면 Open 상태로 전환되어 즉시 실패를 반환한다. 타임아웃 후 Half-Open 상태에서 제한된 요청을 허용하여 서비스 복구 여부를 확인한다.

이 패턴은 Retry 패턴과 다른 목적을 가진다. Retry 패턴은 결국 성공할 것이라는 기대로 재시도하는 것이고, 서킷 브레이커는 실패할 가능성이 높은 작업의 수행 자체를 방지한다. 두 패턴을 결합하여 사용할 수 있으며, 재시도 로직은 서킷 브레이커가 반환하는 예외에 민감하게 반응해야 한다.

---

## 2. Detailed Summary

### 2.1 Context and Problem (맥락과 문제)

분산 환경(distributed environment)에서 원격 리소스 및 서비스 호출은 일시적 장애(transient faults)로 인해 실패할 수 있다. 일시적 장애에는 과도하게 사용된 리소스, 느린 네트워크 연결, 타임아웃(time-out) 등이 포함되며, 대개 짧은 시간 후 자체적으로 복구된다. 이런 경우 Retry 패턴 같은 전략으로 관리할 수 있다.

그러나 예기치 않은 이벤트로 인해 복구에 더 오랜 시간이 걸리는 장애가 발생할 수 있다. 부분적인 연결 손실부터 완전한 서비스 장애까지 심각도가 다양하며, 이런 상황에서 성공할 가능성이 낮은 작업을 계속 재시도하는 것은 부적절하다. 서비스가 바쁜 상태에서 한 부분의 장애는 **연쇄 장애(cascading failures)**로 이어질 수 있다. 타임아웃을 구현하더라도, 차단된 동시 요청(concurrent requests)이 메모리, 스레드, 데이터베이스 연결 같은 중요 시스템 리소스를 점유하여 리소스가 고갈될 수 있다.

### 2.2 Solution (해결책) - 상태 머신

서킷 브레이커는 실패할 가능성이 높은 작업을 반복적으로 실행하는 것을 방지하는 프록시(proxy)로 동작한다. 세 가지 상태로 구성된 상태 머신으로 구현한다:

**Closed (닫힘)**: 요청이 정상적으로 작업에 라우팅된다. 최근 실패 횟수를 카운트하며, 지정된 시간 내 실패 수가 임계값을 초과하면 Open 상태로 전환하고 타임아웃 타이머를 시작한다. 실패 카운터(failure counter)는 시간 기반으로 주기적으로 자동 리셋된다.

**Open (열림)**: 요청이 즉시 실패하며 예외가 애플리케이션에 반환된다. 타이머가 만료되면 Half-Open 상태로 전환된다.

**Half-Open (반열림)**: 제한된 수의 요청만 통과시켜 작업을 호출한다. 성공하면 장애가 수정된 것으로 판단하여 Closed 상태로 전환하고 실패 카운터를 리셋한다. 하나라도 실패하면 장애가 여전히 존재하는 것으로 판단하여 Open 상태로 복귀한다. Half-Open 상태는 복구 중인 서비스가 갑자기 요청으로 넘쳐나는 것을 방지한다.

![Circuit Breaker 상태 다이어그램](/images/circuit-breaker-diagram.png)

### 2.3 Problems and Considerations (문제와 고려사항)

이 패턴을 구현할 때 고려해야 할 핵심 요소들:

- **예외 처리(Exception Handling)**: 서킷 브레이커를 통해 작업을 호출하는 애플리케이션은 작업이 사용 불가능할 때의 예외를 처리할 수 있어야 한다. 기능 저하(degrade), 대안 작업 호출, 사용자에게 재시도 요청 등의 전략을 사용한다.

- **예외 유형(Types of Exceptions)**: 요청 실패 원인의 심각도는 다양하다. 서킷 브레이커는 예외 유형을 검사하고 그에 맞게 전략을 조정할 수 있다. 예를 들어 타임아웃 예외와 서비스 불가 예외에 대해 다른 임계값을 적용할 수 있다.

- **모니터링(Monitoring)**: 운영 팀이 시스템 상태를 평가할 수 있도록 실패와 성공 요청 모두에 대한 명확한 관측 가능성(observability)을 제공해야 한다. 분산 추적(distributed tracing)을 사용하여 서비스 간 end-to-end 가시성을 확보한다.

- **복구 가능성(Recoverability)**: 서킷 브레이커를 보호하는 작업의 예상 복구 패턴에 맞게 구성해야 한다. Open 상태가 너무 길면 장애 원인이 해소되었어도 계속 예외를 발생시킬 수 있고, Half-Open으로 너무 빨리 전환하면 응답 시간이 저하될 수 있다.

- **동시성(Concurrency)**: 대규모 동시 인스턴스가 동일한 서킷 브레이커에 접근할 수 있으므로, 구현이 동시 요청을 차단하거나 각 호출에 과도한 오버헤드를 추가하지 않아야 한다.

- **리소스 차별화(Resource Differentiation)**: 여러 독립 제공자가 있는 리소스에 단일 서킷 브레이커를 사용할 때 주의해야 한다. 데이터 저장소의 여러 샤드(shard) 중 일부만 문제가 있을 때, 에러 응답이 병합되면 정상 샤드까지 차단될 수 있다.

- **가속 서킷 브레이킹(Accelerated Circuit Breaking)**: 실패 응답에 서킷 브레이커를 즉시 트립(trip)시킬 충분한 정보가 포함될 수 있다. 예를 들어 HTTP 429 (Too Many Requests)나 503 (Service Unavailable) 응답의 예상 지연 시간 정보를 활용한다.

- **서비스 메시 서킷 브레이커(Service Mesh Circuit Breakers)**: 애플리케이션 레이어에서 구현하거나, 서비스 메시(service mesh)에서 사이드카(sidecar) 또는 독립 기능으로 애플리케이션 코드 수정 없이 서킷 브레이킹을 지원할 수 있다.

- **적응형 기법(Adaptive Techniques)**: 전통적으로 서킷 브레이커는 미리 구성된 임계값(failure count, timeout duration)에 의존했으나, AI와 머신 러닝을 활용하여 실시간 트래픽 패턴, 이상 징후, 과거 실패율을 기반으로 동적으로 임계값을 조정하는 적응형 접근법이 가능하다.

### 2.4 When to Use This Pattern (사용 시점)

**사용해야 할 때:**
- 과도한 원격 서비스 호출을 중단하여 연쇄 장애를 방지하고자 할 때
- 실시간 장애 신호 기반으로 트래픽을 지능적으로 라우팅하여 다중 리전(multi-region) 복원력을 강화할 때
- 느린 의존성(slow dependencies)으로부터 보호하여 SLO(Service Level Objectives)를 유지하고자 할 때
- 분산 환경에서 간헐적 연결 문제를 관리하고 요청 실패를 줄이고자 할 때

**적합하지 않을 때:**
- 인메모리 데이터 구조 같은 로컬 프라이빗 리소스 접근 관리 시 (오버헤드만 추가)
- 비즈니스 로직의 예외 처리 대체 수단으로 사용하려 할 때
- 잘 알려진 재시도 알고리즘으로 충분하고 의존성이 재시도를 처리하도록 설계되어 있을 때
- 메시지 기반(message-driven) 또는 이벤트 기반(event-driven) 아키텍처에서 dead letter queue와 내장 실패 격리 메커니즘이 충분할 때
- 글로벌 로드 밸런서나 서비스 메시의 헬스 체크처럼 인프라/플랫폼 수준에서 장애 복구가 관리될 때

### 2.5 Example - Azure Cosmos DB와 서킷 브레이커

이 예시는 Azure Cosmos DB lifetime free tier의 쿼타(quota) 초과를 방지하기 위해 서킷 브레이커 패턴을 구현한다. 비핵심 데이터(noncritical data)를 위한 용량 계획에서 초당 할당된 리소스 유닛(resource units)이 정해져 있으며, 시즌 이벤트 시 수요가 용량을 초과하여 429 응답이 발생할 수 있다.

```
Flow A (Closed): 정상 운영 → 모든 요청이 DB에 도달, 429 없음
Flow B (Open):  첫 429 응답 → 서킷 트립 → 기본/캐시 응답 반환
                → Azure Monitor 동적 임계값 경고 → 운영팀 알림
                → 승인 후 처리량 증가 또는 부하 자연 감소 대기
Flow C (Half-Open): 타임아웃 후 제한된 시험 요청 허용
                    → 성공 시 Closed로 복귀 (Flow A)
                    → 실패 지속 시 Open으로 복귀 (Flow B)
```

![Azure Cosmos DB와 서킷 브레이커 아키텍처](/images/circuit-breaker-pattern.svg)

주요 구성 요소:
- **Azure App Service**: 클라이언트 요청의 진입점. 서킷 브레이커 정책을 적용하고 회로 개방 시 기본/캐시 응답을 제공
- **Azure Cosmos DB**: 데이터 저장소. free tier로 비핵심 데이터 서빙. 고수요 시 트래픽 제한
- **Azure Monitor**: 중앙 모니터링. App Service와 Cosmos DB의 로그/텔레메트리 수집 및 분석
- **Azure Monitor Alerts**: 동적 임계값 기반 경고 규칙으로 잠재적 중단 식별

Azure Monitor의 동적 임계값(dynamic thresholds)은 학습을 통해 조정된다. 서킷 브레이커가 자체적으로 문제를 처리한 장기 중단은 학습 알고리즘에서 제외되어, 다음 과부하 시 더 높은 에러율을 기다리게 되며, 이는 비용 및 운영 효율성을 향상시킨다.

### 2.6 Azure Well-Architected Framework과의 관계

| Pillar | 서킷 브레이커 패턴의 지원 |
|--------|---------------------------|
| **Reliability** | 장애가 있는 의존성의 과부하를 방지하고 우아한 성능 저하(graceful degradation)를 유도. 자기 보존(self-preservation)과 자기 치유(self-healing) 제공 |
| **Performance Efficiency** | 의존성 복구 중 과도한 리소스 사용을 유발하는 retry-on-error 접근을 회피 |

---

## 3. Conclusion and Personal View

1. 서킷 브레이커 패턴은 분산 시스템에서 연쇄 장애를 방지하는 핵심 안정성 패턴으로, 전기 회로 차단기의 Closed/Open/Half-Open 세 가지 상태를 모방한다.

2. Retry 패턴과의 차이를 명확히 이해해야 한다 - Retry는 "결국 성공할 것"이라는 기대로 재시도하는 것이고, 서킷 브레이커는 "실패할 가능성이 높은 작업 자체를 차단"하는 것이다.

3. Half-Open 상태는 복구 중인 서비스가 갑작스러운 트래픽 쇄도로 다시 실패하는 것을 방지하는 중요한 보호 장치이다.

4. 실패 카운터의 시간 기반 자동 리셋은 간헐적 실패로 인한 불필요한 서킷 트립을 방지한다.

5. 서비스 메시에서 사이드카 패턴으로 구현하면 애플리케이션 코드 수정 없이 서킷 브레이킹을 적용할 수 있어 관심사 분리(separation of concerns) 측면에서 우수하다.

6. AI/ML 기반 적응형 임계값 조정은 전통적인 정적 임계값 방식보다 더 효율적이고 회복력 있는 동작을 제공할 수 있다.

7. 리소스 차별화(resource differentiation)는 실무에서 자주 간과되는 중요한 고려사항이다. 샤딩된 데이터 저장소에서 단일 서킷 브레이커 사용 시 정상 샤드까지 차단되는 문제가 발생할 수 있다.

8. Azure Cosmos DB 예시처럼 비용 관리와 직접 연계되는 시나리오에서 서킷 브레이커의 실용적 가치가 극대화된다.

9. 메시지/이벤트 기반 아키텍처에서는 dead letter queue와 내장 격리 메커니즘이 있으므로 서킷 브레이커가 불필요한 복잡성을 추가할 수 있다는 점도 중요한 판단 기준이다.

10. Spring Cloud(Resilience4j), Polly(.NET), Hystrix(deprecated) 같은 프레임워크가 서킷 브레이커 구현을 제공하며, 프로덕션에서는 이러한 검증된 라이브러리를 활용하는 것이 권장된다.

---

## Related Resources

- Retry Pattern - 일시적 장애에 대한 재시도 전략
- Health Endpoint Monitoring Pattern - 서비스 상태 확인을 위한 헬스 체크
- Sidecar Pattern - 크로스커팅 관심사의 모듈식 추상화
- Reliable Web App Pattern - 클라우드 수렴 웹 앱에서의 서킷 브레이커 적용
