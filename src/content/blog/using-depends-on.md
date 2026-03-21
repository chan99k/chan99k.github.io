---
title: "Using depends-on"
description: "Spring IoC 컨테이너에서 빈(Bean) 간의 초기화 순서를 명시적으로 제어하는 `depends-on` 속성에 대한 문서입니다. 일반적으로 빈 간의 의존성은 `<ref/>` 요소나 autowiring을 통해 관리되지만, 데이터베이스 드라이버 등록과 같이 정적 초기화가 필요한 경우에는 간접적인 의존성 관계가 존재할 수 있습니다. `depends-on` 속성 또는 `@DependsOn` 어노테이션을 사용하면 특정 빈이 초기화되기 전에 다른 빈들이 먼저 초기화되도록 강제할 수 있으며, 싱글톤 빈의 경우 소멸 순서도 제어할 수 있습니다."
pubDate: "2026-03-10"
tags: ["Resources/translations/Spring/IoC Container"]
contentSource: "ai-assisted"
draft: false
---

# Using depends-on

> 원문: [Using depends-on](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-dependson.html)

## 전문 번역

### Using depends-on (depends-on 사용하기)

만약 어떤 빈이 다른 빈의 의존성(dependency)이라면, 이는 일반적으로 한 빈이 다른 빈의 프로퍼티로 설정된다는 것을 의미합니다. 전형적으로 이는 XML 기반 메타데이터에서 [`<ref/>` 요소](factory-properties-detailed.html#beans-ref-element)를 사용하거나 [autowiring](factory-autowire.html)을 통해 달성할 수 있습니다.

그러나 때때로 빈 간의 의존성은 덜 직접적일 수 있습니다. 예를 들어 클래스의 정적 초기화자(static initializer)가 트리거되어야 하는 경우를 들 수 있는데, 데이터베이스 드라이버 등록이 그러한 경우입니다. `depends-on` 속성 또는 `@DependsOn` 어노테이션은 이 요소를 사용하는 빈이 초기화되기 전에 하나 이상의 빈을 명시적으로 먼저 초기화하도록 강제할 수 있습니다. 다음 예시는 `depends-on` 속성을 사용하여 단일 빈에 대한 의존성을 표현합니다:

```xml
<bean id="beanOne" class="ExampleBean" depends-on="manager"/>
<bean id="manager" class="ManagerBean" />
```

여러 빈에 대한 의존성을 표현하려면, `depends-on` 속성의 값으로 빈 이름 목록을 제공하면 됩니다 (쉼표, 공백, 세미콜론이 유효한 구분자입니다):

```xml
<bean id="beanOne" class="ExampleBean" depends-on="manager,accountDao">
    <property name="manager" ref="manager" />
</bean>

<bean id="manager" class="ManagerBean" />
<bean id="accountDao" class="x.y.jdbc.JdbcAccountDao" />
```

**Note (참고)**

`depends-on` 속성은 초기화 시점(initialization-time) 의존성과 [싱글톤(singleton)](../factory-scopes.html#beans-factory-scopes-singleton) 빈의 경우에만 해당되는 대응하는 소멸 시점(destruction-time) 의존성을 모두 지정할 수 있습니다. 특정 빈과 `depends-on` 관계를 정의한 의존 빈들(dependent beans)은 해당 빈 자체가 소멸되기 전에 먼저 소멸됩니다. 따라서 `depends-on`은 종료(shutdown) 순서도 제어할 수 있습니다.


**Navigation (탐색)**

- Prev (이전): [Dependencies and Configuration in Detail (의존성과 구성 상세)](factory-properties-detailed.html)
- Next (다음): [Lazy-initialized Beans (지연 초기화 빈)](factory-lazy-init.html)
