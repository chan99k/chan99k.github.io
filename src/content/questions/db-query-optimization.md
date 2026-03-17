---
title: "SQL 쿼리 최적화 기법 중 인덱스 활용과 실행 계획 분석 방법을 설명하세요"
answer: "WHERE, JOIN, ORDER BY 절에 사용되는 컬럼에 인덱스를 생성하고, 복합 인덱스는 카디널리티가 높은 컬럼을 앞에 배치합니다. SELECT *를 피하고 필요한 컬럼만 조회하며, 서브쿼리보다 JOIN을 선호합니다. EXPLAIN(MySQL) 또는 EXPLAIN ANALYZE(PostgreSQL)로 실행 계획을 분석하여 Full Table Scan, Index Scan, Seq Scan 등을 확인하고 비효율적인 부분을 개선합니다. type이 ALL이면 Full Scan이므로 인덱스 추가를 고려해야 합니다."
category: "database"
difficulty: 3
tags: ["쿼리 최적화", "실행 계획", "인덱스"]
source: "curated"
hints: ["EXPLAIN", "복합 인덱스 순서", "Full Scan 회피"]
---

## 해설

인덱스를 타지 못하는 경우:
```sql
-- Bad: 인덱스 컬럼에 함수 적용
WHERE YEAR(created_at) = 2025

-- Good: 범위 조건 사용
WHERE created_at >= '2025-01-01' AND created_at < '2026-01-01'

-- Bad: 묵시적 형변환
WHERE user_id = '123'  -- user_id가 INT인 경우

-- Good: 명시적 타입
WHERE user_id = 123
```

복합 인덱스 (A, B, C) 생성 시:
- WHERE A: 인덱스 사용 O
- WHERE A AND B: 인덱스 사용 O
- WHERE B: 인덱스 사용 X (A 없음)
