---
title: "String Pool의 동작 방식과 new String()의 차이를 설명하세요"
answer: "String literal은 String Pool(Java 7부터 Heap 영역)에 저장되며, 동일한 문자열은 재사용됩니다. new String()은 매번 새로운 객체를 Heap에 생성합니다. String Pool은 intern() 메서드로 명시적으로 추가할 수 있으며, 메모리 효율성을 높이지만 너무 많은 문자열을 intern하면 오히려 메모리 부담이 됩니다."
category: "java"
difficulty: 2
tags: ["String", "메모리", "최적화"]
source: "curated"
hints: ["literal vs new", "intern()", "메모리 재사용"]
---

## 해설

```java
String s1 = "hello";        // String Pool
String s2 = "hello";        // 같은 참조 반환
String s3 = new String("hello");  // 새 객체 생성
s1 == s2  // true
s1 == s3  // false
s1.equals(s3)  // true
```

Java 7 이전에는 String Pool이 PermGen에 있어 크기 제한이 있었으나, 이후 Heap으로 이동하여 GC 대상이 되었습니다.
