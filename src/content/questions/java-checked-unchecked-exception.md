---
title: "Java의 Checked Exception과 Unchecked Exception의 차이와 사용 기준을 설명하세요"
answer: "Checked Exception(IOException, SQLException 등)은 컴파일 타임에 체크되며 명시적 처리(try-catch 또는 throws)가 강제됩니다. Unchecked Exception(RuntimeException 하위)은 실행 중 발생하며 처리가 선택적입니다. Checked는 복구 가능한 예외 상황에, Unchecked는 프로그래밍 오류(NullPointerException, IllegalArgumentException)에 사용합니다. 최근 트렌드는 과도한 Checked Exception을 Unchecked로 래핑하여 코드 간결성을 높이는 방향입니다."
category: "java"
difficulty: 2
tags: ["예외처리", "RuntimeException", "Best Practice"]
source: "curated"
hints: ["컴파일 타임 체크", "복구 가능성", "최근 트렌드"]
---

## 해설

Checked Exception의 문제점:
```java
// 계층마다 throws 전파 필요
public void method1() throws IOException {
    method2();
}
public void method2() throws IOException {
    method3();
}
```

Spring의 DataAccessException은 SQLException(Checked)을 Unchecked로 래핑하여 간결한 코드를 가능하게 합니다. 함수형 프로그래밍(Stream, Lambda)에서는 Checked Exception이 사용하기 어려워 Unchecked로 변환이 필요합니다.
