---
title: "Spring @Transactional의 전파 속성(Propagation) 중 REQUIRED, REQUIRES_NEW, NESTED를 비교하세요"
answer: "REQUIRED는 기존 트랜잭션이 있으면 참여하고 없으면 새로 생성하는 기본값입니다. REQUIRES_NEW는 항상 새 트랜잭션을 생성하고 기존 트랜잭션을 일시 중단합니다. NESTED는 기존 트랜잭션 내에 중첩 트랜잭션(savepoint)을 생성하여 부분 롤백이 가능하지만 JDBC 3.0 savepoint를 지원하는 DataSource가 필요합니다."
category: "spring"
difficulty: "senior"
tags: ["트랜잭션", "전파", "롤백"]
source: "curated"
hints: ["기본값", "일시 중단", "savepoint"]
---

## 해설

```java
@Transactional  // REQUIRED
public void outer() {
    inner();  // 같은 트랜잭션
}

@Transactional(propagation = REQUIRES_NEW)
public void inner() {
    // 독립적인 트랜잭션, outer와 별개로 커밋/롤백
}

@Transactional(propagation = NESTED)
public void nested() {
    // outer 트랜잭션의 savepoint, 실패 시 여기까지만 롤백
}
```

REQUIRES_NEW는 로그 저장처럼 메인 트랜잭션 실패와 무관하게 커밋되어야 할 때, NESTED는 배치 작업에서 부분 실패 허용 시 유용합니다.
