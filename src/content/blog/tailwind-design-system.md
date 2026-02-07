---
title: "Tailwind CSS로 디자인 시스템 구축하기"
description: "Tailwind CSS v4의 @theme 디렉티브를 활용한 일관된 디자인 시스템 구축 경험을 공유합니다."
pubDate: "2026-02-01"
tags: ["개발/CSS", "디자인/시스템", "디자인/UI"]
---

Tailwind CSS v4의 `@theme` 디렉티브는 디자인 토큰을 CSS 변수로 자연스럽게 정의할 수 있게 해줍니다.

## @theme 디렉티브

```css
@theme {
  --color-accent: #FF4800;
  --font-sans: 'Pretendard Variable', sans-serif;
}
```

## 29CM 스타일 적용

미니멀한 흑백 기반에 포인트 컬러를 하나만 사용하는 것이 핵심입니다.
