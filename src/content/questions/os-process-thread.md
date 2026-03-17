---
title: "프로세스와 스레드의 차이, 멀티프로세스와 멀티스레드의 장단점을 설명하세요"
answer: "프로세스는 독립적인 메모리 공간을 가진 실행 단위로 다른 프로세스와 격리되어 있고, 스레드는 프로세스 내에서 메모리를 공유하는 실행 흐름입니다. 멀티프로세스는 안정적이지만(한 프로세스 종료가 다른 프로세스에 영향 없음) 메모리와 컨텍스트 스위칭 비용이 크고, 멀티스레드는 가볍고 빠르지만 한 스레드의 오류가 전체 프로세스를 종료시킬 수 있고 동기화 문제가 발생합니다. IPC(Inter-Process Communication)는 파이프, 소켓, 공유 메모리 등으로 구현됩니다."
category: "os"
difficulty: 2
tags: ["운영체제", "동시성", "메모리"]
source: "curated"
hints: ["메모리 격리", "컨텍스트 스위칭", "동기화"]
---

## 해설

메모리 구조:
- 프로세스: Code, Data, Heap, Stack 독립
- 스레드: Code, Data, Heap 공유, Stack만 독립

멀티프로세스 예시:
- Chrome 브라우저(탭마다 프로세스)
- Nginx(worker 프로세스)

멀티스레드 예시:
- Java/Spring 애플리케이션(요청당 스레드)
- 웹 서버의 Thread Pool

동기화 문제:
```java
// Race Condition
int counter = 0;
// Thread 1: counter++
// Thread 2: counter++
// 결과: 2가 아닐 수 있음

// 해결: synchronized
synchronized(lock) { counter++; }
```
