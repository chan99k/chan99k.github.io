---
title: "CQRS 패턴을 왜 사용하고, 어떤 장단점이 있나요?"
answer: "CQRS(Command Query Responsibility Segregation)는 데이터의 읽기(Query)와 쓰기(Command) 모델을 분리하는 패턴입니다. 읽기/쓰기 최적화를 독립적으로 수행할 수 있고, 이벤트 소싱과 결합하여 감사 로그를 자연스럽게 확보할 수 있습니다. 단점으로는 복잡성 증가, 데이터 일관성 지연(Eventual Consistency)이 있습니다."
category: "architecture"
difficulty: "senior"
tags: ["DDD", "이벤트 소싱", "확장성"]
source: "curated"
relatedPosts: ["cqrs-pattern"]
hints: ["읽기/쓰기 분리", "Eventual Consistency", "이벤트 소싱"]
---

## 해설

CQRS는 도메인이 복잡하고 읽기/쓰기 비율이 극단적으로 다른 경우에 특히 유용합니다. 단순 CRUD 애플리케이션에서는 오버 엔지니어링이 될 수 있으므로, 도입 전 트레이드오프를 신중히 검토해야 합니다.
