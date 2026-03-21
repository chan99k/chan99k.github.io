---
title: "Lazy-initialized Beans"
description: "Spring의 ApplicationContext는 기본적으로 모든 싱글톤 빈을 초기화 과정에서 즉시 생성하고 구성한다. 이는 설정 오류를 즉시 발견할 수 있다는 장점이 있지만, 특정 상황에서는 빈의 지연 초기화(lazy initialization)가 필요할 수 있다. 지연 초기화 빈은 시작 시점이 아닌 처음 요청될 때 생성되며, `@Lazy` 애노테이션 또는 XML의 `lazy-init` 속성을 통해 설정할 수 있다."
pubDate: "2026-03-10"
tags: ["Resources/translations/Spring/IoC Container"]
contentSource: "ai-assisted"
draft: false
---

# Lazy-initialized Beans

> 원문: [Lazy-initialized Beans](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-lazy-init.html)

## 전문 번역

### Lazy-initialized Beans (지연 초기화 빈)

기본적으로 `ApplicationContext` 구현체는 초기화 프로세스의 일부로 모든 [싱글톤](../factory-scopes.html#beans-factory-scopes-singleton) 빈을 즉시(eagerly) 생성하고 구성한다. 일반적으로 이러한 사전 인스턴스화(pre-instantiation)는 바람직한데, 설정이나 주변 환경의 오류가 몇 시간 또는 며칠 후가 아니라 즉시 발견되기 때문이다. 이러한 동작이 바람직하지 않은 경우, 빈 정의를 지연 초기화(lazy-initialized)로 표시하여 싱글톤 빈의 사전 인스턴스화를 방지할 수 있다. 지연 초기화 빈은 IoC 컨테이너에게 시작 시점이 아니라 처음 요청될 때 빈 인스턴스를 생성하도록 지시한다.

이 동작은 `@Lazy` 애노테이션으로 제어되며, XML에서는 `<bean/>` 요소의 `lazy-init` 속성으로 제어된다. 다음 예시를 참고하라:

**Java:**
```java
@Bean
@Lazy
ExpensiveToCreateBean lazy() {
    return new ExpensiveToCreateBean();
}

@Bean
AnotherBean notLazy() {
    return new AnotherBean();
}
```

**Kotlin:**
```kotlin
@Bean
@Lazy
fun lazy() = ExpensiveToCreateBean()

@Bean
fun notLazy() = AnotherBean()
```

**XML:**
```xml
<bean id="lazy" class="com.something.ExpensiveToCreateBean" lazy-init="true"/>
<bean name="not.lazy" class="com.something.AnotherBean"/>
```

위 구성이 `ApplicationContext`에 의해 사용될 때, `lazy` 빈은 `ApplicationContext`가 시작될 때 즉시 사전 인스턴스화되지 않는 반면, `notLazy` 빈은 즉시 사전 인스턴스화된다.

그러나 지연 초기화 빈이 지연 초기화되지 않은 싱글톤 빈의 의존성인 경우, `ApplicationContext`는 싱글톤의 의존성을 충족시켜야 하므로 시작 시점에 지연 초기화 빈을 생성한다. 지연 초기화 빈은 지연 초기화되지 않은 다른 싱글톤 빈에 주입된다.

또한 `@Configuration` 애노테이션이 달린 클래스에 `@Lazy` 애노테이션을 사용하거나, XML에서 `<beans/>` 요소의 `default-lazy-init` 속성을 사용하여 여러 빈의 지연 초기화를 제어할 수 있다. 다음 예시를 참고하라:

**Java:**
```java
@Configuration
@Lazy
public class LazyConfiguration {
    // No bean will be pre-instantiated...
}
```

**Kotlin:**
```kotlin
@Configuration
@Lazy
class LazyConfiguration {
    // No bean will be pre-instantiated...
}
```

**XML:**
```xml
<beans default-lazy-init="true">
    <!-- no beans will be pre-instantiated... -->
</beans>
```
