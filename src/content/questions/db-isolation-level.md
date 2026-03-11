---
title: "데이터베이스 트랜잭션 격리 수준(Isolation Level) 4단계를 비교하세요"
answer: "READ UNCOMMITTED는 커밋되지 않은 데이터를 읽어 Dirty Read가 발생합니다. READ COMMITTED는 커밋된 데이터만 읽지만 Non-Repeatable Read가 가능합니다. REPEATABLE READ는 트랜잭션 내에서 같은 조회 결과를 보장하지만 Phantom Read가 발생할 수 있습니다. SERIALIZABLE은 완전한 격리로 모든 이상 현상을 방지하지만 동시성이 크게 낮아집니다. MySQL InnoDB는 REPEATABLE READ가 기본값이며, PostgreSQL과 Oracle은 READ COMMITTED가 기본값입니다."
category: "database"
difficulty: "mid"
tags: ["트랜잭션", "격리수준", "동시성"]
source: "curated"
hints: ["Dirty/Non-Repeatable/Phantom Read", "기본값", "동시성 트레이드오프"]
---

## 해설

이상 현상 정리:
- Dirty Read: 커밋 안 된 변경 읽기
- Non-Repeatable Read: 같은 데이터 재조회 시 값이 변경됨
- Phantom Read: 같은 조건 재조회 시 행이 추가/삭제됨

MySQL InnoDB는 MVCC(Multi-Version Concurrency Control)와 Gap Lock을 사용하여 REPEATABLE READ에서도 Phantom Read를 방지합니다. 실무에서는 READ COMMITTED로 낮춰 성능을 높이고, 필요시 비관적/낙관적 락을 추가로 사용합니다.
