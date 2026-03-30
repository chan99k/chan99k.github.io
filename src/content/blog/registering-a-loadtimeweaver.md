---
title: "Registering a LoadTimeWeaver"
description: "Spring의 `LoadTimeWeaver`는 클래스가 JVM(Java Virtual Machine)에 로드될 때 동적으로 변환(transformation)하는 기능을 제공한다. 이 문서는 `@EnableLoadTimeWeaving` 어노테이션을 사용한 Java 기반 설정과 `<context:load-time-weaver/>` 요소를 사용한 XML 기반 설정 두 가지 방법을 소개한다. 로드타임 위빙은 특히 Spring의 JPA 지원과 함께 사용될 때 유용하며, JPA 클래스 변환에 필요할 수 있다."
pubDate: "2026-03-10"
tags: ["Resources/translations/Spring/core/IoC Container"]
contentSource: "ai-assisted"
draft: false
---

# Registering a LoadTimeWeaver

> 원문: [Registering a LoadTimeWeaver](https://docs.spring.io/spring-framework/reference/core/beans/context-load-time-weaver.html)

## 전문 번역

### Registering a LoadTimeWeaver (LoadTimeWeaver 등록)

`LoadTimeWeaver`는 Spring이 클래스가 Java 가상 머신(JVM)에 로드될 때 동적으로 변환하기 위해 사용된다.

로드타임 위빙을 활성화하려면, 다음 예제와 같이 `@Configuration` 클래스 중 하나에 `@EnableLoadTimeWeaving`을 추가할 수 있다:

**Java:**
```java
@Configuration
@EnableLoadTimeWeaving
public class AppConfig {
}
```

**Kotlin:**
```kotlin
@Configuration
@EnableLoadTimeWeaving
class AppConfig
```

또는 XML 설정의 경우, `context:load-time-weaver` 요소를 사용할 수 있다:

```xml
<beans>
    <context:load-time-weaver/>
</beans>
```

`ApplicationContext`에 대해 한번 설정되면, 해당 `ApplicationContext` 내의 모든 빈은 `LoadTimeWeaverAware`를 구현할 수 있으며, 이를 통해 로드타임 위버 인스턴스에 대한 참조를 받을 수 있다. 이는 특히 [Spring의 JPA 지원](../../data-access/orm/jpa.html)과 결합될 때 유용한데, JPA 클래스 변환에 로드타임 위빙이 필요할 수 있기 때문이다. 더 자세한 내용은 [`LocalContainerEntityManagerFactoryBean`](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/orm/jpa/LocalContainerEntityManagerFactoryBean.html) javadoc을 참조하라. AspectJ 로드타임 위빙에 대한 자세한 내용은 [Load-time Weaving with AspectJ in the Spring Framework](../aop/using-aspectj.html#aop-aj-ltw)를 참조하라.
