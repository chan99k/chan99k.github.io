---
title: "Annotation-based Container Configuration"
description: "Spring Framework는 애너테이션 기반 구성(annotation-based configuration)에 대한 포괄적인 지원을 제공하며, 이를 통해 XML 구성 대신 클래스, 메서드, 필드에 직접 애너테이션을 사용하여 메타데이터를 정의할 수 있습니다. `BeanPostProcessor`와 애너테이션을 결합하여 Spring IoC 컨테이너가 특정 애너테이션을 인식하도록 합니다. 이 문서는 `@Autowired`, `@PostConstruct`, `@PreDestroy`와 같은 JSR-250 애너테이션, 그리고 `@Inject`, `@Named`와 같은 JSR-330 애너테이션에 대한 개요를 제공합니다."
pubDate: "2026-03-10"
tags: ["Resources/translations/Spring/IoC Container"]
contentSource: "ai-assisted"
draft: false
---

# Annotation-based Container Configuration

> 원문: [Annotation-based Container Configuration](https://docs.spring.io/spring-framework/reference/core/beans/annotation-config.html)

## 전문 번역

### Annotation-based Container Configuration (애너테이션 기반 컨테이너 구성)

Spring은 애너테이션 기반 구성에 대한 포괄적인 지원을 제공하며, 관련 클래스, 메서드 또는 필드 선언에 애너테이션을 사용하여 컴포넌트 클래스 자체에서 메타데이터를 조작합니다. [Example: The AutowiredAnnotationBeanPostProcessor](https://docs.spring.io/spring-framework/reference/core/beans/factory-extension.html#beans-factory-extension-bpp-examples-aabpp)에서 언급했듯이, Spring은 `BeanPostProcessors`를 애너테이션과 함께 사용하여 핵심 IOC 컨테이너가 특정 애너테이션을 인식하도록 합니다.

예를 들어, `@Autowired` 애너테이션은 [Autowiring Collaborators](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-autowire.html)에 설명된 것과 동일한 기능을 제공하지만 더 세밀한 제어와 더 넓은 적용 가능성을 제공합니다. 또한 Spring은 `@PostConstruct` 및 `@PreDestroy`와 같은 JSR-250 애너테이션과 `jakarta.inject` 패키지에 포함된 `@Inject` 및 `@Named`와 같은 JSR-330(Dependency Injection for Java) 애너테이션을 지원합니다. 이러한 애너테이션에 대한 자세한 내용은 [관련 섹션](https://docs.spring.io/spring-framework/reference/core/beans/standard-annotations.html)에서 확인할 수 있습니다.

> **Note (참고)**
>
> 애너테이션 주입(Annotation injection)은 외부 프로퍼티 주입(external property injection) 이전에 수행됩니다. 따라서 외부 구성(예: XML로 지정된 빈 프로퍼티)은 혼합 접근 방식으로 연결될 때 프로퍼티에 대한 애너테이션을 효과적으로 재정의합니다.

기술적으로는 post-processor들을 개별 빈 정의로 등록할 수 있지만, 이들은 이미 `AnnotationConfigApplicationContext`에 암시적으로 등록되어 있습니다.

XML 기반 Spring 설정에서는 다음 구성 태그를 포함하여 애너테이션 기반 구성과 혼합 및 매칭을 활성화할 수 있습니다:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:context="http://www.springframework.org/schema/context"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
		https://www.springframework.org/schema/beans/spring-beans.xsd
		http://www.springframework.org/schema/context
		https://www.springframework.org/schema/context/spring-context.xsd">

	<context:annotation-config/>

</beans>
```

`<context:annotation-config/>` 엘리먼트는 다음 post-processor들을 암시적으로 등록합니다:

- [`ConfigurationClassPostProcessor`](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/context/annotation/ConfigurationClassPostProcessor.html)
- [`AutowiredAnnotationBeanPostProcessor`](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/beans/factory/annotation/AutowiredAnnotationBeanPostProcessor.html)
- [`CommonAnnotationBeanPostProcessor`](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/context/annotation/CommonAnnotationBeanPostProcessor.html)
- [`PersistenceAnnotationBeanPostProcessor`](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/orm/jpa/support/PersistenceAnnotationBeanPostProcessor.html)
- [`EventListenerMethodProcessor`](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/context/event/EventListenerMethodProcessor.html)

> **Note (참고)**
>
> `<context:annotation-config/>`는 정의된 동일한 애플리케이션 컨텍스트 내의 빈에서만 애너테이션을 찾습니다. 이는 `DispatcherServlet`을 위한 `WebApplicationContext`에 `<context:annotation-config/>`를 넣으면 서비스가 아닌 컨트롤러에서만 `@Autowired` 빈을 검사한다는 것을 의미합니다. 자세한 내용은 [The DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)을 참조하세요.
