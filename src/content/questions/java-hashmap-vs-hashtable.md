---
title: "HashMap과 Hashtable의 차이점을 설명하세요"
answer: "HashMap은 비동기(non-synchronized)로 동작하며 null 키와 null 값을 허용합니다. Hashtable은 synchronized로 스레드 안전하지만 성능이 낮고, null을 허용하지 않습니다. Java 5 이후에는 ConcurrentHashMap이 Hashtable의 대안으로 권장됩니다."
category: "java"
difficulty: "junior"
tags: ["Collections", "동기화", "Thread-safe"]
source: "curated"
relatedPosts: ["meta-tag-collection-optimization"]
hints: ["동기화", "null 허용", "ConcurrentHashMap"]
---

## 해설

HashMap은 AbstractMap을 상속하고 Map 인터페이스를 구현합니다. 내부적으로 해시 테이블 기반의 배열과 연결 리스트(Java 8부터는 트리)를 사용합니다. Hashtable은 Dictionary를 상속하는 레거시 클래스로, 모든 메서드가 synchronized되어 있어 단일 스레드 환경에서는 불필요한 오버헤드가 발생합니다.
