---
title: "Java Stream의 병렬 처리(parallelStream)의 장단점과 주의사항을 설명하세요"
answer: "parallelStream()은 ForkJoinPool을 사용하여 멀티코어를 활용해 대용량 데이터를 빠르게 처리할 수 있습니다. 하지만 컨텍스트 스위칭 오버헤드가 있어 소량 데이터나 I/O 작업에는 오히려 느립니다. 스레드 안전하지 않은 컬렉션 사용, 순서 의존성, 공유 상태 변경은 위험합니다. CPU 바운드 작업에 적합하며, 일반적으로 데이터가 수만 건 이상일 때 효과적입니다."
category: "java"
difficulty: 3
tags: ["Stream", "병렬처리", "ForkJoinPool"]
source: "curated"
hints: ["ForkJoinPool", "오버헤드", "스레드 안전"]
---

## 해설

성능 비교:
```java
// 소량(< 1만): sequential이 빠름
list.stream().filter(...).count();

// 대량(> 10만) CPU 집약적: parallel이 빠름
list.parallelStream().filter(...).count();

// I/O 작업: parallel 비효율
list.parallelStream().map(id -> db.findById(id));  // 나쁜 예
```

주의사항:
- ArrayList는 분할이 쉬워 병렬화에 유리, LinkedList는 불리
- ForkJoinPool.commonPool()의 스레드 수는 CPU 코어 수 - 1
- 순서가 중요하면 forEachOrdered() 사용
