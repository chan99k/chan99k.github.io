---
title: "Layered Architecture의 구조와 계층 간 의존성 규칙을 설명하세요"
answer: "Layered Architecture는 Presentation, Business, Persistence, Database 계층으로 구성되며, 상위 계층은 하위 계층에만 의존해야 합니다. 각 계층은 명확한 책임을 가지고 있어 관심사 분리와 테스트가 용이합니다. 하지만 모든 요청이 계층을 순차적으로 거쳐야 하므로 단순 CRUD에서는 불필요한 복잡도가 발생하고, 도메인 로직이 여러 계층에 분산될 수 있습니다. DTO를 통해 계층 간 데이터를 전달하고, 인터페이스로 의존성을 역전시켜 결합도를 낮춥니다."
category: "architecture"
difficulty: "mid"
tags: ["아키텍처", "계층화", "관심사 분리"]
source: "curated"
hints: ["단방향 의존성", "DTO", "CRUD 복잡도"]
---

## 해설

전형적인 Spring MVC 구조:
```
Controller (Presentation)
    ↓
Service (Business Logic)
    ↓
Repository (Persistence)
    ↓
Database
```

주의사항:
- Controller가 Repository를 직접 호출하면 안 됨(계층 우회)
- Entity를 그대로 반환하지 말고 DTO로 변환
- 트랜잭션은 Service 계층에서 관리

Layered Architecture의 한계로 인해 Hexagonal, Clean Architecture 등이 등장
