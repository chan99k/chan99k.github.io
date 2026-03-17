---
title: "Strategy 패턴의 구조와 실무 적용 사례를 설명하세요"
answer: "Strategy 패턴은 알고리즘을 캡슐화하고 상호 교환 가능하게 만들어 런타임에 동작을 변경할 수 있습니다. Context는 Strategy 인터페이스를 참조하고, 구체적인 전략(ConcreteStrategy)을 주입받아 사용합니다. if-else나 switch-case를 제거하고 OCP(개방-폐쇄 원칙)를 준수할 수 있습니다. 실무에서는 결제 수단 선택, 할인 정책, 정렬 알고리즘, 파일 압축 방식 등에 사용됩니다. Spring에서는 의존성 주입으로 자연스럽게 구현됩니다."
category: "architecture"
difficulty: 3
tags: ["디자인 패턴", "OCP", "다형성"]
source: "curated"
hints: ["알고리즘 캡슐화", "런타임 변경", "if-else 제거"]
---

## 해설

구현 예시:
```java
// Strategy 인터페이스
interface PaymentStrategy {
    void pay(int amount);
}

// Concrete Strategies
class CreditCardPayment implements PaymentStrategy {
    public void pay(int amount) { /* 신용카드 결제 */ }
}
class KakaoPayPayment implements PaymentStrategy {
    public void pay(int amount) { /* 카카오페이 결제 */ }
}

// Context
class Order {
    private PaymentStrategy paymentStrategy;

    public void checkout(int amount) {
        paymentStrategy.pay(amount);  // 전략에 위임
    }
}
```

Spring에서는 Map<String, PaymentStrategy>로 여러 전략을 관리하고 키로 선택
