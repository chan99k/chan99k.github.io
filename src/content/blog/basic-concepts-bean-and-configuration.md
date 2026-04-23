---
title: "Basic Concepts: @Bean and @Configuration"
description: "Spring의 Java 기반 설정에서 가장 핵심적인 두 가지 애너테이션은 `@Bean`과 `@Configuration`이다. `@Bean` 애너테이션은 메서드가 Spring IoC 컨테이너가 관리할 새로운 객체를 인스턴스화하고, 구성하며, 초기화한다는 것을 나타낸다. 이는 XML 설정의 `<bean/>` 요소와 동일한 역할을 수행한다."
pubDate: "2026-03-10"
tags: ["Resources/translations/spring/core/ioc-container"]
contentSource: "ai-assisted"
series: "Spring IoC Container"
seriesOrder: 16
draft: false
---

# Basic Concepts: @Bean and @Configuration

> 원문: [Basic Concepts: @Bean and @Configuration](https://docs.spring.io/spring-framework/reference/core/beans/java/basic-concepts.html)

## 전문 번역

### Basic Concepts: `@Bean` and `@Configuration` (기본 개념: `@Bean`과 `@Configuration`)

Spring의 Java 설정 지원에서 핵심 아티팩트는 `@Configuration` 애너테이션이 붙은 클래스와 `@Bean` 애너테이션이 붙은 메서드이다.

`@Bean` 애너테이션은 메서드가 Spring IoC 컨테이너가 관리할 새로운 객체를 인스턴스화(instantiate), 구성(configure), 초기화(initialize)한다는 것을 나타내는 데 사용된다. Spring의 `<beans/>` XML 설정에 익숙한 사람들에게, `@Bean` 애너테이션은 `<bean/>` 요소와 동일한 역할을 수행한다. `@Bean` 애너테이션이 붙은 메서드는 모든 Spring `@Component`와 함께 사용할 수 있다. 하지만, 가장 자주 `@Configuration` 빈과 함께 사용된다.

`@Configuration` 애너테이션으로 클래스를 표시하는 것은 그 클래스의 주요 목적이 빈 정의(bean definition)의 소스라는 것을 나타낸다. 더 나아가, `@Configuration` 클래스는 같은 클래스 내의 다른 `@Bean` 메서드를 호출하여 빈 간 의존성(inter-bean dependencies)을 정의할 수 있게 한다. 가장 단순한 형태의 `@Configuration` 클래스는 다음과 같다:

```java
@Configuration
public class AppConfig {

    @Bean
    public MyServiceImpl myService() {
        return new MyServiceImpl();
    }
}
```

앞의 `AppConfig` 클래스는 다음의 Spring `<beans/>` XML과 동등하다:

```xml
<beans>
    <bean id="myService" class="com.acme.services.MyServiceImpl"/>
</beans>
```

#### `@Configuration` classes with or without local calls between `@Bean` methods? (`@Bean` 메서드 간 로컬 호출이 있는 `@Configuration` 클래스와 없는 클래스의 차이)

일반적인 시나리오에서, `@Bean` 메서드는 `@Configuration` 클래스 내에서 선언되어야 하며, 이를 통해 전체 설정 클래스 처리(full configuration class processing)가 적용되고 메서드 간 교차 참조(cross-method references)가 컨테이너의 생명주기 관리(lifecycle management)로 리다이렉트된다. 이렇게 하면 동일한 `@Bean` 메서드가 일반 Java 메서드 호출을 통해 실수로 호출되는 것을 방지할 수 있으며, 추적하기 어려운 미묘한 버그를 줄이는 데 도움이 된다.

`@Bean` 메서드가 `@Configuration` 애너테이션이 붙지 않은 클래스 내에서 선언되거나, `@Configuration(proxyBeanMethods=false)`가 선언된 경우, 이러한 메서드들은 "lite" 모드로 처리된다고 한다. 이러한 시나리오에서, `@Bean` 메서드는 특별한 런타임 처리 없이(즉, CGLIB 서브클래스를 생성하지 않고) 효과적으로 범용 팩토리 메서드 메커니즘(general-purpose factory method mechanism)이 된다. 이러한 메서드에 대한 사용자 정의 Java 호출은 컨테이너에 의해 가로채지지 않으므로, 일반 메서드 호출처럼 동작하여, 주어진 빈에 대해 기존 싱글톤(singleton) 또는 스코프(scoped) 인스턴스를 재사용하는 것이 아니라 매번 새로운 인스턴스를 생성한다.

결과적으로, 런타임 프록시(runtime proxying)가 없는 클래스의 `@Bean` 메서드는 빈 간 의존성을 선언하는 데 적합하지 않다. 대신, 이러한 메서드들은 포함하는 컴포넌트의 필드(fields)에서 동작하거나, 선택적으로 팩토리 메서드가 선언할 수 있는 인자들을 통해 자동 주입된 협력자(autowired collaborators)를 받을 것으로 예상된다. 따라서 이러한 `@Bean` 메서드는 다른 `@Bean` 메서드를 호출할 필요가 없다. 이러한 모든 호출은 대신 팩토리 메서드 인자를 통해 표현될 수 있다. 여기서 긍정적인 부작용은 런타임에 CGLIB 서브클래싱을 적용할 필요가 없어서 오버헤드(overhead)와 풋프린트(footprint)가 감소한다는 것이다.

`@Bean`과 `@Configuration` 애너테이션은 다음 섹션들에서 깊이 있게 논의된다. 그러나 먼저, Java 기반 설정을 사용하여 Spring 컨테이너를 생성하는 다양한 방법들을 다룬다.
