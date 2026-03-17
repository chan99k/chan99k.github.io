---
title: "Builder 패턴의 GoF 방식과 Effective Java 방식의 차이를 설명하세요"
answer: "GoF Builder는 Director가 Builder 인터페이스를 통해 복잡한 객체를 단계적으로 생성하며, 다양한 표현(representation)을 지원합니다. Effective Java Builder는 불변 객체 생성에 초점을 맞춘 정적 내부 클래스 방식으로, 메서드 체이닝을 통해 가독성과 안전성을 높입니다. GoF는 다형성 중심, Effective Java는 불변성과 가독성 중심입니다."
category: "java"
difficulty: 3
tags: ["디자인 패턴", "GoF", "불변 객체"]
source: "curated"
relatedPosts: ["builder-pattern"]
hints: ["Director vs 정적 내부 클래스", "불변 객체", "메서드 체이닝"]
---

## 해설

실무에서는 Effective Java 방식이 압도적으로 많이 사용됩니다. Lombok의 @Builder도 이 방식을 자동 생성합니다. GoF 방식은 복잡한 문서 변환기(HTML/PDF/Markdown)처럼 여러 출력 형식이 필요한 경우에 적합합니다.
