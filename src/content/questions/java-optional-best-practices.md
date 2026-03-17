---
title: "Java Optional의 올바른 사용법과 안티패턴을 설명하세요"
answer: "Optional은 메서드 반환 타입으로 사용하여 null 가능성을 명시적으로 표현합니다. of(), ofNullable(), empty()로 생성하고, isPresent() 체크보다 map(), flatMap(), orElse(), orElseThrow() 등 함수형 메서드를 선호해야 합니다. 필드나 메서드 파라미터로 사용하거나, Optional.get()을 직접 호출하거나, Optional을 컬렉션에 담는 것은 안티패턴입니다."
category: "java"
difficulty: 3
tags: ["Optional", "함수형", "Best Practice"]
source: "curated"
hints: ["반환 타입", "isPresent() 지양", "필드 사용 금지"]
---

## 해설

권장 패턴:
```java
// Good
public Optional<User> findById(Long id) {
    return userRepository.findById(id);
}

user.map(User::getName)
    .orElse("Unknown");

// Bad
Optional<User> user;  // 필드로 사용 금지
public void process(Optional<User> user) {}  // 파라미터로 사용 금지
if (user.isPresent()) { user.get(); }  // get() 직접 호출 지양
```

orElse()는 항상 실행되고, orElseGet()은 값이 없을 때만 실행되므로 비용이 큰 연산은 orElseGet() 사용
