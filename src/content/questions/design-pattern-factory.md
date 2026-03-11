---
title: "Factory Method와 Abstract Factory 패턴의 차이를 설명하세요"
answer: "Factory Method는 객체 생성을 서브클래스에 위임하여 생성 로직을 캡슐화합니다. Template Method 패턴과 유사하게 상속을 사용하며, 하나의 제품군을 다룹니다. Abstract Factory는 관련된 객체군을 생성하는 인터페이스를 제공하며, 구성(composition)을 사용합니다. 여러 제품군(예: Windows UI와 Mac UI)을 일관되게 생성할 때 사용합니다. Factory Method는 단일 제품 확장, Abstract Factory는 제품군 전체 교체에 적합합니다."
category: "architecture"
difficulty: "mid"
tags: ["디자인 패턴", "GoF", "객체 생성"]
source: "curated"
hints: ["상속 vs 구성", "단일 제품 vs 제품군", "확장성"]
---

## 해설

Factory Method:
```java
abstract class Creator {
    abstract Product createProduct();  // 서브클래스가 구현

    void operation() {
        Product p = createProduct();
        p.use();
    }
}

class ConcreteCreator extends Creator {
    Product createProduct() {
        return new ConcreteProduct();
    }
}
```

Abstract Factory:
```java
interface UIFactory {
    Button createButton();
    TextField createTextField();
}

class WindowsFactory implements UIFactory {
    Button createButton() { return new WindowsButton(); }
    TextField createTextField() { return new WindowsTextField(); }
}
```

실무에서는 정적 팩토리 메서드(Static Factory Method)가 더 흔함
