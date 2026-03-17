---
title: "Saga 패턴이 무엇이고, 언제 사용하나요?"
answer: "Saga 패턴은 마이크로서비스 환경에서 분산 트랜잭션을 관리하는 패턴입니다. 각 서비스의 로컬 트랜잭션을 순차적으로 실행하고, 실패 시 보상 트랜잭션(Compensating Transaction)을 역순으로 실행하여 데이터 일관성을 유지합니다. Choreography(이벤트 기반)와 Orchestration(중앙 조율자) 두 가지 구현 방식이 있습니다."
category: "architecture"
difficulty: 4
tags: ["MSA", "분산 트랜잭션", "이벤트"]
source: "curated"
relatedPosts: ["saga-distributed-transactions-pattern"]
hints: ["보상 트랜잭션", "Choreography", "Orchestration"]
---

## 해설

2PC(Two-Phase Commit)가 분산 환경에서 성능과 가용성 문제를 야기하기 때문에 Saga 패턴이 대안으로 사용됩니다. 각 서비스는 자체 DB 트랜잭션만 관리하며, 전체 비즈니스 트랜잭션의 일관성은 이벤트 체인을 통해 보장됩니다.
