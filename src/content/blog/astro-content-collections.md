---
title: "Astro Content Collections 가이드"
description: "Astro의 Content Collections로 블로그 콘텐츠를 타입 안전하게 관리하는 방법을 알아봅니다."
pubDate: "2026-01-15"
tags: ["개발/Astro", "개발/TypeScript", "TIL"]
---

Astro의 Content Collections는 마크다운 콘텐츠를 스키마 기반으로 관리할 수 있게 해줍니다.

## 왜 Content Collections인가?

기존 파일 시스템 기반 라우팅 대비 타입 안전성과 유효성 검사를 제공합니다.

## 기본 설정

`src/content/config.ts`에서 스키마를 정의합니다.

```typescript
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
  }),
});
```
