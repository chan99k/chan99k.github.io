---
title: "빌더 패턴: 불변성과 일관성을 갖춘 객체 생성"
description: "복잡한 객체를 안전하고 유연하게 생성하는 빌더 패턴을 정리한다. 이펙티브 자바 스타일과 GoF 스타일의 차이, 각각의 구조와 사용처를 비교한다."
pubDate: "2026-03-05"
tags: ["Areas/software/design-pattern", "Areas/software/lang/java"]
draft: true
---

> 불변성과 **일관성**을 확보하여 **복잡한 객체를 안전하고 유연하게 생성**하는 기법

## 이펙티브 자바(Effective Java) 빌더 패턴

> 오늘날 가장 널리 사용되는 형태로, **안전하고 읽기 쉬운 객체 생성**이 목적이다.

**장점**

- **높은 가독성**: 각 매개변수의 의미를 명확하게 알 수 있다.
- **불변성 확보**: setter가 없으므로 객체가 생성된 후에 상태가 변하지 않는다.
- **일관성 유지**: `build()` 메서드 호출 전까지는 객체가 생성되지 않으므로, 불완전한 상태의 객체가 사용될 일이 없다.
- **유연한 생성**: 필수 값과 선택 값을 명확히 구분하여 유연하게 객체를 생성할 수 있다.

### 핵심 구조 및 예시

보통 생성하려는 객체 내부에 **static 내부 클래스**로 `Builder`를 정의한다.

- Builder는 필수 매개변수를 받는 생성자를 가진다.
- 선택적 매개변수는 setter와 유사한 메서드(예: `cheese()`, `bacon()`)를 통해 설정하며, 이 메서드는 Builder 자신을 반환하여 **메서드 체이닝(Method Chaining)**이 가능하게 한다.
- 마지막으로 `build()` 메서드를 호출하여 **불변 객체**인 최종 결과물을 생성한다.

```java
import java.time.LocalDate;

public class Person {
    private final String firstName;
    private final String lastName;
    private final LocalDate birthDate;
    private final String addressOne;
    private final String addressTwo;
    private final String sex;
    private final boolean driverLicence;
    private final boolean married;

    // Builder를 통해서만 생성할 수 있도록 private 생성자를 정의한다.
    private Person(PersonBuilder builder) {
        this.firstName = builder.firstName;
        this.lastName = builder.lastName;
        this.birthDate = builder.birthDate;
        this.addressOne = builder.addressOne;
        this.addressTwo = builder.addressTwo;
        this.sex = builder.sex;
        this.driverLicence = builder.driverLicence;
        this.married = builder.married;
    }

    // 외부에서 빌더를 생성할 수 있는 static 팩토리 메서드
    public static PersonBuilder builder() {
        return new PersonBuilder();
    }

    // static 내부 클래스로 Builder를 정의한다.
    public static class PersonBuilder {
        private String firstName;
        private String lastName;
        private LocalDate birthDate;
        private String addressOne;
        private String addressTwo;
        private String sex;
        private boolean driverLicence;
        private boolean married;

        public PersonBuilder firstName(String firstName) {
            this.firstName = firstName;
            return this;
        }

        public PersonBuilder lastName(String lastName) {
            this.lastName = lastName;
            return this;
        }

        public PersonBuilder birthDate(LocalDate birthDate) {
            this.birthDate = birthDate;
            return this;
        }

        public PersonBuilder addressOne(String addressOne) {
            this.addressOne = addressOne;
            return this;
        }

        public PersonBuilder addressTwo(String addressTwo) {
            this.addressTwo = addressTwo;
            return this;
        }

        public PersonBuilder sex(String sex) {
            this.sex = sex;
            return this;
        }

        public PersonBuilder driverLicence(boolean driverLicence) {
            this.driverLicence = driverLicence;
            return this;
        }

        public PersonBuilder married(boolean married) {
            this.married = married;
            return this;
        }

        // private 생성자를 호출하여 최종 불변 객체를 생성한다.
        public Person build() {
            return new Person(this);
        }
    }
}
```

## GoF(Gang of Four) 빌더 패턴

> 객체 생성의 과정을 분리하는 데 더 중점을 둔 고전적인 방식이다.

### 핵심 구조 및 참여자

- **Product**: 최종적으로 생성될 복잡한 객체.
- **Builder (인터페이스)**: `Product`를 생성하기 위한 각 부품(Part)을 만드는 메서드를 정의한다.
- **ConcreteBuilder**: `Builder` 인터페이스를 구현하며, 실제 부품을 만들고 조립하여 `Product`를 반환한다.
- **Director**: `Builder` 인터페이스를 사용하여 객체 생성 **'과정'**을 정의하고 실행한다. `Director`는 `ConcreteBuilder`의 구체적인 내용은 알지 못한다.

### 동작 방식

1. 클라이언트는 특정 ConcreteBuilder를 생성하여 Director에게 전달한다.
2. 클라이언트는 Director에게 객체 생성을 요청한다.
3. Director는 정해진 순서(알고리즘)에 따라 Builder의 메서드를 호출하여 부품을 조립한다.
4. 조립이 끝나면, 클라이언트는 Builder로부터 최종 결과물(Product)을 받는다.

Director는 **동일한 생성 과정**을 사용하지만, 어떤 ConcreteBuilder를 사용하느냐에 따라 **다른 형태의 Product**가 만들어지는 것이 핵심이다. 예를 들어 TourDirector는 '여행 계획'이라는 동일한 생성 과정을 실행하지만, ShortTripBuilder를 사용하면 '짧은 여행 계획'이, LongTripBuilder를 사용하면 '긴 여행 계획'이 만들어진다.

## 두 패턴의 비교

| 구분 | GoF 빌더 패턴 | 이펙티브 자바 빌더 패턴 |
|---|---|---|
| **주요 목적** | 생성 **'과정'**과 **'표현'**의 분리 | **불변성**과 **가독성**을 갖춘 객체 생성 |
| **Director의 유무** | **존재함** (생성 과정을 통제) | **존재하지 않음** (클라이언트가 직접 조립) |
| **구조** | 여러 클래스로 분리 (Director, Builder, Product) | 보통 생성할 클래스의 static 내부 클래스로 구현 |
| **일반적인 사용처** | 동일한 프로세스로 여러 종류의 객체를 만들어야 할 때 | 매개변수가 많은 객체를 안전하고 읽기 쉽게 만들어야 할 때 |
