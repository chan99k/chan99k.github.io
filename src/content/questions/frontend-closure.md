---
title: "JavaScript의 Closure 개념과 실무 활용 사례를 설명하세요"
answer: "Closure는 함수가 선언될 때의 Lexical Environment(렉시컬 환경)를 기억하여, 외부 함수가 종료된 후에도 내부 함수가 외부 변수에 접근할 수 있는 현상입니다. 데이터 은닉(private 변수), 함수 팩토리, 콜백에서 상태 유지 등에 활용됩니다. 하지만 메모리 누수를 유발할 수 있으므로 불필요한 참조는 제거해야 합니다. 모듈 패턴, React Hooks, 이벤트 핸들러 등에서 흔히 사용됩니다."
category: "frontend"
difficulty: "mid"
tags: ["JavaScript", "Closure", "Scope"]
source: "curated"
hints: ["Lexical Environment", "데이터 은닉", "메모리 누수"]
---

## 해설

기본 예시:
```javascript
function outer() {
    let count = 0;
    return function inner() {
        count++;
        console.log(count);
    };
}

const counter = outer();
counter();  // 1
counter();  // 2  (count를 기억)
```

실무 활용:
```javascript
// Private 변수
function createWallet() {
    let balance = 0;  // 외부 접근 불가
    return {
        deposit: (amount) => balance += amount,
        getBalance: () => balance
    };
}

// React Hook
function useCounter() {
    const [count, setCount] = useState(0);  // Closure로 상태 유지
    return { count, increment: () => setCount(count + 1) };
}
```
