---
title: "Virtual DOM의 동작 원리와 성능 이점을 설명하세요"
answer: "Virtual DOM은 실제 DOM을 JavaScript 객체로 표현한 가상의 DOM입니다. 상태 변경 시 새로운 Virtual DOM을 생성하고, 이전 Virtual DOM과 비교(Diffing)하여 변경된 부분만 실제 DOM에 반영(Reconciliation)합니다. 직접 DOM 조작보다 효율적인 이유는 DOM 접근 비용이 비싸기 때문에 여러 변경을 모아서 한 번에 반영(Batching)하기 때문입니다. React, Vue 등에서 사용하며, Svelte는 Virtual DOM 없이 컴파일 타임에 최적화합니다."
category: "frontend"
difficulty: "mid"
tags: ["React", "Virtual DOM", "성능"]
source: "curated"
hints: ["Diffing", "Reconciliation", "Batching"]
---

## 해설

Virtual DOM 동작:
```
State 변경 → 새 Virtual DOM 생성
    ↓
Diffing Algorithm (이전 vs 새 VDOM 비교)
    ↓
변경 사항만 추출 (패치)
    ↓
실제 DOM 업데이트 (Batching)
```

성능 이점:
- 여러 변경을 모아서 한 번에 처리
- 최소한의 DOM 조작으로 Reflow/Repaint 감소
- 복잡한 UI 업데이트 최적화

오해:
Virtual DOM이 항상 빠른 것은 아님. 단순 업데이트는 직접 DOM 조작이 빠를 수 있으나, 복잡한 상태 변경에서 개발자가 최적화를 신경 쓰지 않아도 되는 것이 장점.

React의 Fiber는 Virtual DOM을 더욱 발전시킨 재조정 엔진.
