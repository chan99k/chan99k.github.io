---
title: "Deadlock(교착상태)의 발생 조건과 예방/회피/탐지/복구 방법을 설명하세요"
answer: "Deadlock은 두 개 이상의 프로세스/스레드가 서로 상대방의 자원을 기다리며 무한 대기하는 상태입니다. 발생 조건은 Mutual Exclusion(상호 배제), Hold and Wait(점유와 대기), No Preemption(비선점), Circular Wait(순환 대기) 4가지가 모두 만족되어야 합니다. 예방은 4가지 조건 중 하나를 제거하고, 회피는 은행원 알고리즘으로 안전 상태만 허용하며, 탐지는 자원 할당 그래프로 사이클을 찾고, 복구는 프로세스 종료 또는 자원 선점으로 해결합니다."
category: "os"
difficulty: "mid"
tags: ["운영체제", "동시성", "교착상태"]
source: "curated"
hints: ["4가지 조건", "은행원 알고리즘", "순환 대기"]
---

## 해설

Deadlock 예시:
```java
Thread 1: lock(A) → lock(B)
Thread 2: lock(B) → lock(A)
// 서로 상대방이 보유한 락을 기다림
```

예방 방법:
- Mutual Exclusion 제거: 불가능(동기화 필요)
- Hold and Wait 제거: 모든 자원을 한 번에 요청
- No Preemption 제거: 타임아웃 설정
- Circular Wait 제거: 자원에 순서 부여(항상 A → B 순서)

실무 해결책:
- Lock 순서 통일
- Timeout 설정 (Database deadlock timeout)
- Lock-free 자료구조 (CAS 연산)
- 비관적 락보다 낙관적 락 사용

Database Deadlock:
```sql
-- Transaction 1: A 잠금 → B 잠금 시도
-- Transaction 2: B 잠금 → A 잠금 시도
```
MySQL은 자동 탐지 후 하나를 롤백
