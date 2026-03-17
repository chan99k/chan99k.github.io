---
title: "브라우저 렌더링 과정(Critical Rendering Path)을 설명하세요"
answer: "브라우저는 HTML을 파싱하여 DOM Tree를 생성하고, CSS를 파싱하여 CSSOM Tree를 생성합니다. 이 둘을 결합하여 Render Tree를 만들고, Layout(Reflow) 단계에서 각 요소의 크기와 위치를 계산합니다. Paint 단계에서 픽셀로 그리고, Composite 단계에서 레이어를 합성하여 화면에 표시합니다. JavaScript는 DOM/CSSOM 접근 시 파싱을 중단(blocking)하므로 script 태그 위치가 중요합니다. async/defer 속성으로 비차단 로딩이 가능합니다."
category: "frontend"
difficulty: 3
tags: ["브라우저", "렌더링", "성능"]
source: "curated"
hints: ["DOM/CSSOM", "Reflow/Repaint", "async/defer"]
---

## 해설

렌더링 최적화:
- CSS는 head에, JS는 body 끝에 배치
- 중요한 CSS는 인라인으로 삽입(Critical CSS)
- 불필요한 Reflow 방지(layout thrashing)
- transform/opacity는 GPU 가속 사용(Composite만 발생)

```javascript
// Bad: Reflow 여러 번 발생
element.style.width = '100px';
element.style.height = '100px';

// Good: 한 번만 발생
element.style.cssText = 'width: 100px; height: 100px;';
```

defer vs async:
- defer: HTML 파싱 완료 후 순서대로 실행
- async: 다운로드 완료 즉시 실행(순서 무관)
