---
title: "데이터베이스 Replication과 Sharding의 차이와 구현 전략을 설명하세요"
answer: "Replication은 데이터를 여러 서버에 복제하여 읽기 성능과 가용성을 높입니다. Master-Slave 구조에서 Master는 쓰기, Slave는 읽기를 담당하며, 비동기 복제로 인한 Replication Lag이 발생할 수 있습니다. Sharding은 데이터를 여러 서버에 분산 저장하여 쓰기 성능과 저장 용량을 확장합니다. Range, Hash, Directory 방식이 있으며, 트랜잭션과 조인이 어려워지고 재샤딩 비용이 큽니다. Replication은 수평 읽기 확장, Sharding은 수평 쓰기 확장에 적합합니다."
category: "database"
difficulty: "senior"
tags: ["Replication", "Sharding", "확장성"]
source: "curated"
hints: ["Master-Slave", "데이터 분산", "Replication Lag"]
---

## 해설

Replication 구성:
- Master-Slave: 단방향 복제, 읽기 부하 분산
- Master-Master: 양방향 복제, 쓰기 분산 가능하지만 충돌 위험

Sharding 전략:
- Range: user_id 1-1000 → Shard1, 1001-2000 → Shard2 (불균등 분산 위험)
- Hash: user_id % shard_count (균등 분산, 재샤딩 어려움)
- Directory: 별도 룩업 테이블로 매핑 (유연하지만 단일 장애점)

실무에서는 Replication으로 시작하고, 쓰기 부하가 크면 Sharding 추가
