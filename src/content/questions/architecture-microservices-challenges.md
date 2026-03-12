---
title: "마이크로서비스 아키텍처의 주요 과제와 해결 방안을 설명하세요"
answer: "마이크로서비스는 분산 트랜잭션, 서비스 간 통신 복잡도, 데이터 일관성, 배포/모니터링 복잡성 등의 과제가 있습니다. 분산 트랜잭션은 Saga 패턴(Choreography/Orchestration)으로 해결하고, 통신은 Service Mesh(Istio, Linkerd)로 관리하며, 데이터 일관성은 Event Sourcing과 CQRS로 보완합니다. API Gateway로 진입점을 단일화하고, Circuit Breaker로 장애를 격리하며, Distributed Tracing(Zipkin, Jaeger)으로 요청 흐름을 추적합니다. 초기에는 Monolith로 시작하여 도메인이 안정화된 후 분리하는 것이 권장됩니다."
category: "architecture"
difficulty: "senior"
tags: ["MSA", "분산 시스템", "트랜잭션"]
source: "curated"
hints: ["Saga", "Service Mesh", "분산 트랜잭션"]
---

## 해설

주요 과제와 해결책:

1. 분산 트랜잭션:
- 문제: ACID 보장 어려움
- 해결: Saga 패턴 (보상 트랜잭션), Eventual Consistency

2. 서비스 디스커버리:
- 문제: 동적 IP, 스케일링
- 해결: Eureka, Consul, Kubernetes Service

3. 통신 복잡도:
- 문제: 서비스 간 N:M 통신
- 해결: Service Mesh, gRPC

4. 데이터 일관성:
- 문제: 분산 DB, Eventual Consistency
- 해결: Event-Driven, CQRS

5. 모니터링:
- 문제: 분산 로그, 성능 추적
- 해결: ELK Stack, Prometheus, Grafana

언제 MSA를 피해야 하나:
- 팀이 작을 때 (< 10명)
- 도메인이 불명확할 때
- 빠른 개발이 필요할 때
