---
title: "Circuit Breaker 패턴의 동작 원리를 설명하세요"
answer: "Circuit Breaker는 외부 서비스 호출 실패가 임계치를 초과하면 회로를 열어 추가 호출을 차단하고, 일정 시간 후 반열림(Half-Open) 상태에서 복구를 시도합니다. Closed(정상) -> Open(차단) -> Half-Open(시험) 세 가지 상태로 전이되며, 장애 전파를 방지하고 시스템 복원력을 높입니다."
category: "architecture"
difficulty: 3
tags: ["Resilience", "장애 대응", "MSA"]
source: "curated"
relatedPosts: ["circuit-breaker-pattern"]
hints: ["Closed/Open/Half-Open", "임계치", "장애 전파 방지"]
---

## 해설

Netflix Hystrix에서 대중화된 패턴으로, 현재는 Resilience4j가 주로 사용됩니다. Fallback 전략과 함께 사용하여 사용자 경험을 유지하면서 장애를 격리할 수 있습니다.
