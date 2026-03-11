---
title: "Hexagonal Architecture(Ports and Adapters)의 핵심 개념을 설명하세요"
answer: "Hexagonal Architecture는 비즈니스 로직(Core)을 중심에 두고, 외부 시스템(DB, UI, API)과의 상호작용을 Ports(인터페이스)와 Adapters(구현체)로 분리합니다. Core는 외부에 의존하지 않고 순수한 도메인 로직만 포함하며, Inbound Port(Use Case 인터페이스)로 요청을 받고 Outbound Port(Repository 인터페이스)로 외부를 호출합니다. Adapter는 Port를 구현하여 실제 기술(JPA, REST, Kafka)을 연결합니다. 의존성이 항상 내부로 향해 테스트가 쉽고 기술 변경에 유연합니다."
category: "architecture"
difficulty: "senior"
tags: ["Hexagonal", "DDD", "의존성 역전"]
source: "curated"
hints: ["Ports and Adapters", "의존성 방향", "기술 독립"]
---

## 해설

구조:
```
Adapter (REST Controller) → Inbound Port (Service Interface)
                                    ↓
                              Core (Domain Logic)
                                    ↓
                           Outbound Port (Repository Interface) → Adapter (JPA)
```

장점:
- Core가 프레임워크/DB에 독립적
- 여러 Adapter 동시 지원(REST + gRPC)
- 모킹 없이 Fake Adapter로 테스트 가능

단점:
- 인터페이스 증가로 코드량 증가
- 간단한 CRUD에는 과한 복잡도
