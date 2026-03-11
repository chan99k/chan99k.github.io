---
title: "JVM 메모리 구조에서 Heap과 Stack의 차이를 설명하세요"
answer: "Stack은 각 스레드마다 별도로 생성되며 메서드 호출과 지역 변수를 저장합니다. LIFO 구조로 메서드 종료 시 자동으로 해제됩니다. Heap은 모든 스레드가 공유하는 영역으로 객체 인스턴스와 배열이 저장되며, GC(Garbage Collector)가 관리합니다. Stack은 빠르지만 크기가 제한적이고, Heap은 크지만 상대적으로 느립니다."
category: "java"
difficulty: "junior"
tags: ["JVM", "메모리", "GC"]
source: "curated"
hints: ["스레드 별 생성", "객체 저장 위치", "GC 대상"]
---

## 해설

Stack에는 기본 타입 변수와 객체 참조 변수가 저장되고, 실제 객체는 Heap에 저장됩니다. OutOfMemoryError는 Heap 공간 부족 시, StackOverflowError는 Stack 공간 부족(주로 무한 재귀) 시 발생합니다. Java 8부터는 PermGen이 제거되고 Metaspace가 추가되어 Native Memory를 사용합니다.
