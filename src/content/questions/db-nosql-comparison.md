---
title: "RDBMS와 NoSQL의 차이와 각각의 사용 사례를 설명하세요"
answer: "RDBMS는 스키마가 고정되고 ACID 트랜잭션을 보장하며 정규화된 데이터와 복잡한 조인을 지원합니다. 수직 확장(Scale-up)에 유리하지만 수평 확장이 어렵습니다. NoSQL은 스키마가 유연하고 수평 확장이 쉬우며, BASE(Basically Available, Soft state, Eventually consistent) 모델로 동작합니다. Key-Value(Redis), Document(MongoDB), Column-family(Cassandra), Graph(Neo4j) 등 다양한 유형이 있습니다. RDBMS는 금융, 주문 등 ACID가 중요한 경우, NoSQL은 대용량 로그, 세션, 캐시 등에 적합합니다."
category: "database"
difficulty: "mid"
tags: ["RDBMS", "NoSQL", "확장성"]
source: "curated"
hints: ["ACID vs BASE", "스키마", "수평 확장"]
---

## 해설

NoSQL 유형별 사용 사례:
- Key-Value(Redis): 세션, 캐시, 실시간 순위
- Document(MongoDB): 상품 카탈로그, CMS, 유연한 스키마
- Column-family(Cassandra): 시계열 데이터, 로그, IoT
- Graph(Neo4j): 소셜 네트워크, 추천 시스템

CAP 정리: Consistency, Availability, Partition Tolerance 중 2개만 선택 가능
- RDBMS: CA (분산 환경에서 제약)
- NoSQL: CP(HBase) 또는 AP(Cassandra)
