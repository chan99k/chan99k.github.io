---
title: "JavaScript의 Event Loop와 Call Stack, Task Queue의 동작을 설명하세요"
answer: "JavaScript는 단일 스레드로 동작하며, Call Stack에서 함수를 실행합니다. 비동기 작업(setTimeout, Promise)은 Web API로 넘어가고, 완료되면 Task Queue(Macro) 또는 Microtask Queue에 콜백을 추가합니다. Event Loop는 Call Stack이 비면 Microtask Queue를 먼저 모두 처리하고, 그 다음 Task Queue에서 하나씩 가져와 실행합니다. Promise는 Microtask, setTimeout은 Task로 Promise가 먼저 실행됩니다."
category: "frontend"
difficulty: "mid"
tags: ["JavaScript", "비동기", "Event Loop"]
source: "curated"
hints: ["단일 스레드", "Microtask vs Task", "Queue 우선순위"]
---

## 해설

실행 순서:
```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');

// 출력: 1 → 4 → 3 → 2
```

설명:
1. '1' 출력 (Call Stack)
2. setTimeout은 Task Queue에 추가
3. Promise는 Microtask Queue에 추가
4. '4' 출력 (Call Stack)
5. Call Stack 비면 Microtask 먼저: '3' 출력
6. Task 처리: '2' 출력

Microtask: Promise, queueMicrotask, MutationObserver
Task(Macrotask): setTimeout, setInterval, I/O
