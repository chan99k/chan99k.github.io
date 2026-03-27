---
title: "Bean Definition Inheritance"
description: "Spring의 빈 정의 상속(Bean Definition Inheritance)은 부모 빈 정의로부터 설정 정보를 상속받아 재사용할 수 있는 기능입니다. 자식 빈 정의는 부모로부터 생성자 인자(constructor arguments), 속성 값(property values), 초기화 메서드(initialization method) 등의 설정 데이터를 상속받으며, 필요에 따라 이를 재정의(override)하거나 새로운 값을 추가할 수 있습니다. 이 기능은 템플릿(templating)의 한 형태로, 반복적인 설정을 줄이고 유지보수를 용이하게 합니다."
pubDate: "2026-03-10"
tags: ["Resources/translations/Spring/IoC Container"]
contentSource: "ai-assisted"
draft: true
---

# Bean Definition Inheritance

> 원문: [Bean Definition Inheritance](https://docs.spring.io/spring-framework/reference/core/beans/child-bean-definitions.html)

## 전문 번역

### Bean Definition Inheritance (빈 정의 상속)

빈 정의(bean definition)는 생성자 인자(constructor arguments), 속성 값(property values), 초기화 메서드(initialization method), 정적 팩토리 메서드 이름(static factory method name) 등과 같은 컨테이너별 정보를 포함하여 많은 설정 정보를 담을 수 있습니다. 자식 빈 정의(child bean definition)는 부모 정의로부터 설정 데이터를 상속받습니다. 자식 정의는 필요에 따라 일부 값을 재정의(override)하거나 다른 값을 추가할 수 있습니다. 부모와 자식 빈 정의를 사용하면 많은 타이핑을 절약할 수 있습니다. 효과적으로, 이것은 템플릿(templating)의 한 형태입니다.

`ApplicationContext` 인터페이스를 프로그래밍 방식으로 사용하는 경우, 자식 빈 정의는 `ChildBeanDefinition` 클래스로 표현됩니다. 대부분의 사용자는 이 수준에서 작업하지 않습니다. 대신, `ClassPathXmlApplicationContext`와 같은 클래스에서 빈 정의를 선언적으로(declaratively) 설정합니다. XML 기반 설정 메타데이터를 사용하는 경우, `parent` 속성을 사용하여 자식 빈 정의를 나타낼 수 있으며, 이 속성의 값으로 부모 빈을 지정합니다. 다음 예제는 이를 수행하는 방법을 보여줍니다:

```xml
<bean id="inheritedTestBean" abstract="true" class="org.springframework.beans.TestBean">
	<property name="name" value="parent"/>
	<property name="age" value="1"/>
</bean>

<bean id="inheritsWithDifferentClass" class="org.springframework.beans.DerivedTestBean"
      parent="inheritedTestBean" init-method="initialize"> <!--1-->
	<property name="name" value="override"/>
	<!-- the age property value of 1 will be inherited from parent -->
</bean>
```

**1** `parent` 속성에 주목하세요.

자식 빈 정의는 클래스가 지정되지 않은 경우 부모 정의의 빈 클래스를 사용하지만, 이를 재정의할 수도 있습니다. 후자의 경우, 자식 빈 클래스는 부모와 호환되어야 합니다(즉, 부모의 속성 값을 받아들여야 합니다).

자식 빈 정의는 부모로부터 스코프(scope), 생성자 인자 값(constructor argument values), 속성 값(property values), 메서드 재정의(method overrides)를 상속받으며, 새로운 값을 추가할 수 있는 옵션을 갖습니다. 지정한 스코프, 초기화 메서드(initialization method), 소멸 메서드(destroy method), 또는 `static` 팩토리 메서드 설정은 해당하는 부모 설정을 재정의합니다.

나머지 설정은 항상 자식 정의에서 가져옵니다: depends on, autowire mode, dependency check, singleton, lazy init.

앞의 예제는 `abstract` 속성을 사용하여 부모 빈 정의를 명시적으로 추상(abstract)으로 표시합니다. 부모 정의가 클래스를 지정하지 않는 경우, 다음 예제와 같이 부모 빈 정의를 명시적으로 `abstract`로 표시하는 것이 필수입니다:

```xml
<bean id="inheritedTestBeanWithoutClass" abstract="true">
	<property name="name" value="parent"/>
	<property name="age" value="1"/>
</bean>

<bean id="inheritsWithClass" class="org.springframework.beans.DerivedTestBean"
      parent="inheritedTestBeanWithoutClass" init-method="initialize">
	<property name="name" value="override"/>
	<!-- age will inherit the value of 1 from the parent bean definition-->
</bean>
```

부모 빈은 불완전하고 명시적으로 `abstract`로 표시되어 있기 때문에 자체적으로 인스턴스화될 수 없습니다. 정의가 `abstract`인 경우, 자식 정의의 부모 정의 역할을 하는 순수 템플릿 빈 정의로만 사용할 수 있습니다. 이러한 `abstract` 부모 빈을 다른 빈의 ref 속성으로 참조하거나 부모 빈 ID로 명시적인 `getBean()` 호출을 수행하여 단독으로 사용하려고 하면 오류가 반환됩니다. 마찬가지로, 컨테이너의 내부 `preInstantiateSingletons()` 메서드는 추상(abstract)으로 정의된 빈 정의를 무시합니다.

> **Note**
>
> `ApplicationContext`는 기본적으로 모든 싱글톤을 사전 인스턴스화합니다. 따라서 (적어도 싱글톤 빈의 경우) 템플릿으로만 사용하려는 (부모) 빈 정의가 있고 이 정의가 클래스를 지정하는 경우, `abstract` 속성을 `true`로 설정해야 합니다. 그렇지 않으면 애플리케이션 컨텍스트가 실제로 `abstract` 빈을 사전 인스턴스화하려고 시도합니다.
