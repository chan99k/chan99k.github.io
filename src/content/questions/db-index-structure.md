---
title: "데이터베이스 인덱스의 B-Tree와 Hash 인덱스의 차이를 설명하세요"
answer: "B-Tree 인덱스는 정렬된 트리 구조로 범위 검색, 정렬, 부분 일치(LIKE 'prefix%')가 가능하며 대부분의 RDBMS에서 기본 인덱스입니다. Hash 인덱스는 해시 함수로 O(1) 검색이 가능하지만 등호(=) 검색만 지원하고 범위 검색이나 정렬은 불가능합니다. B-Tree는 균형 잡힌 트리로 삽입/삭제 시 재정렬 비용이 있지만 안정적이며, Hash는 빠르지만 Hash Collision과 메모리 사용이 단점입니다."
category: "database"
difficulty: "mid"
tags: ["인덱스", "B-Tree", "자료구조"]
source: "curated"
hints: ["범위 검색", "O(1) vs O(log n)", "정렬 가능성"]
---

## 해설

MySQL InnoDB는 B+Tree(리프 노드가 연결 리스트)를 사용하며, 리프 노드에만 데이터를 저장하여 범위 스캔 효율을 높입니다. Clustered Index는 B+Tree의 리프 노드에 실제 데이터를 저장하고, Secondary Index는 Primary Key를 저장합니다.

Hash 인덱스는 MySQL의 MEMORY 엔진이나 PostgreSQL에서 명시적으로 생성 가능하지만, 실무에서는 B-Tree가 범용적으로 사용됩니다.
