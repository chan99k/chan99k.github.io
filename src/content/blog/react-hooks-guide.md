---
title: "React Hooks 실전 패턴"
description: "useState, useEffect를 넘어서 커스텀 훅으로 로직을 재사용하는 패턴을 정리합니다."
pubDate: "2026-01-28"
tags: ["개발/React", "개발/React/Hooks", "TIL"]
---

React Hooks는 함수형 컴포넌트에서 상태와 사이드 이펙트를 관리하는 핵심 도구입니다.

## 커스텀 훅 패턴

반복되는 로직을 `use` 접두사 훅으로 추출합니다.

```tsx
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

## 의존성 배열의 함정

`useEffect`의 의존성 배열을 올바르게 관리하는 것이 가장 중요합니다.
