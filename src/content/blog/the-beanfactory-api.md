---
title: "The BeanFactory API"
description: "`BeanFactory`는 Spring IoC 기능의 기반이 되는 핵심 API로, Spring의 다른 부분 및 서드파티 프레임워크와의 통합에 주로 사용됩니다. `DefaultListableBeanFactory` 구현체는 상위 레벨 `GenericApplicationContext` 컨테이너 내에서 핵심 델리게이트 역할을 합니다. `BeanFactory`와 관련 인터페이스들(`BeanFactoryAware`, `InitializingBean`, `DisposableBean`)은 어노테이션이나 리플렉션 없이도 매우 효율적인 상호작용을 가능하게 합니다."
pubDate: "2026-03-10"
tags: ["Resources/translations/Spring/core/IoC Container"]
contentSource: "ai-assisted"
draft: false
---

# The BeanFactory API

> 원문: [The BeanFactory API](https://docs.spring.io/spring-framework/reference/core/beans/beanfactory.html)

## 전문 번역

### The BeanFactory API

`BeanFactory` API는 Spring의 IoC 기능에 대한 기본 토대를 제공합니다. 이 API의 특정 계약(contracts)은 주로 Spring의 다른 부분들 및 관련 서드파티 프레임워크와의 통합에 사용되며, `DefaultListableBeanFactory` 구현체는 상위 레벨의 `GenericApplicationContext` 컨테이너 내에서 핵심 델리게이트(delegate)입니다.

`BeanFactory`와 관련 인터페이스들(예: `BeanFactoryAware`, `InitializingBean`, `DisposableBean`)은 다른 프레임워크 컴포넌트들과의 중요한 통합 지점입니다. 어떠한 어노테이션이나 심지어 리플렉션도 요구하지 않음으로써, 이들은 컨테이너와 그 컴포넌트들 간의 매우 효율적인 상호작용을 가능하게 합니다. 애플리케이션 레벨의 빈(beans)은 동일한 콜백 인터페이스들을 사용할 수 있지만, 일반적으로는 어노테이션을 통해서든 프로그래매틱 설정을 통해서든 선언적 의존성 주입(declarative dependency injection)을 선호합니다.

핵심 `BeanFactory` API 레벨과 그 `DefaultListableBeanFactory` 구현체는 사용될 설정 형식이나 컴포넌트 어노테이션에 대해 어떠한 가정도 하지 않는다는 점에 유의하십시오. 이러한 모든 형태들은 확장(extensions)을 통해 제공됩니다(예: `XmlBeanDefinitionReader`와 `AutowiredAnnotationBeanPostProcessor`). 이들은 공유되는 `BeanDefinition` 객체들을 핵심 메타데이터 표현으로 조작합니다. 이것이 바로 Spring 컨테이너를 그토록 유연하고 확장 가능하게 만드는 본질입니다.

### BeanFactory or ApplicationContext?

이 섹션에서는 `BeanFactory`와 `ApplicationContext` 컨테이너 레벨 간의 차이점과 부트스트래핑에 대한 영향을 설명합니다.

그렇게 하지 않을 타당한 이유가 없는 한, `ApplicationContext`를 사용해야 합니다. 커스텀 부트스트래핑을 위한 일반적인 구현체로는 `GenericApplicationContext`와 그 서브클래스인 `AnnotationConfigApplicationContext`가 있습니다. 이들은 모든 공통 목적을 위한 Spring 핵심 컨테이너의 주요 진입점입니다: 설정 파일 로딩, 클래스패스 스캔 트리거, 빈 정의 및 어노테이션이 달린 클래스의 프로그래매틱 등록, 그리고 (5.0부터) 함수형 빈 정의의 등록.

`ApplicationContext`는 `BeanFactory`의 모든 기능을 포함하기 때문에, 빈 처리에 대한 완전한 제어가 필요한 시나리오를 제외하고는 일반 `BeanFactory`보다 일반적으로 권장됩니다. `ApplicationContext`(예: `GenericApplicationContext` 구현체) 내에서는 여러 종류의 빈들이 관례에 따라(즉, 빈 이름이나 빈 타입으로 — 특히 post-processors) 감지되는 반면, 일반 `DefaultListableBeanFactory`는 어떠한 특수 빈들에 대해서도 알지 못합니다(agnostic).

어노테이션 처리 및 AOP 프록시와 같은 많은 확장된 컨테이너 기능들에 대해, `BeanPostProcessor` 확장 지점(extension point)은 필수적입니다. 만약 일반 `DefaultListableBeanFactory`만 사용한다면, 그러한 post-processors는 기본적으로 감지되고 활성화되지 않습니다. 이러한 상황은 혼란스러울 수 있는데, 왜냐하면 실제로는 빈 설정에 아무런 문제가 없기 때문입니다. 오히려, 그러한 시나리오에서는 컨테이너가 추가적인 설정을 통해 완전히 부트스트랩될 필요가 있습니다.

다음 표는 `BeanFactory`와 `ApplicationContext` 인터페이스 및 구현체들이 제공하는 기능들을 나열합니다.

**Table 1. Feature Matrix**

| Feature | `BeanFactory` | `ApplicationContext` |
|---------|---------------|----------------------|
| Bean instantiation/wiring | Yes | Yes |
| Integrated lifecycle management | No | Yes |
| Automatic `BeanPostProcessor` registration | No | Yes |
| Automatic `BeanFactoryPostProcessor` registration | No | Yes |
| Convenient `MessageSource` access (for internationalization) | No | Yes |
| Built-in `ApplicationEvent` publication mechanism | No | Yes |

`DefaultListableBeanFactory`에 빈 post-processor를 명시적으로 등록하려면, 다음 예시와 같이 프로그래매틱하게 `addBeanPostProcessor`를 호출해야 합니다:

**Java**
```java
DefaultListableBeanFactory factory = new DefaultListableBeanFactory();
// populate the factory with bean definitions

// now register any needed BeanPostProcessor instances
factory.addBeanPostProcessor(new AutowiredAnnotationBeanPostProcessor());
factory.addBeanPostProcessor(new MyBeanPostProcessor());

// now start using the factory
```

일반 `DefaultListableBeanFactory`에 `BeanFactoryPostProcessor`를 적용하려면, 다음 예시와 같이 그것의 `postProcessBeanFactory` 메서드를 호출해야 합니다:

**Java**
```java
DefaultListableBeanFactory factory = new DefaultListableBeanFactory();
XmlBeanDefinitionReader reader = new XmlBeanDefinitionReader(factory);
reader.loadBeanDefinitions(new FileSystemResource("beans.xml"));

// bring in some property values from a Properties file
PropertySourcesPlaceholderConfigurer cfg = new PropertySourcesPlaceholderConfigurer();
cfg.setLocation(new FileSystemResource("jdbc.properties"));

// now actually do the replacement
cfg.postProcessBeanFactory(factory);
```

두 경우 모두, 명시적인 등록 단계들이 불편하며, 이것이 바로 다양한 `ApplicationContext` 변형들이 Spring 기반 애플리케이션에서 일반 `DefaultListableBeanFactory`보다 선호되는 이유입니다. 특히 일반적인 엔터프라이즈 설정에서 확장된 컨테이너 기능을 위해 `BeanFactoryPostProcessor`와 `BeanPostProcessor` 인스턴스에 의존할 때 더욱 그렇습니다.

> **Note**
>
> `AnnotationConfigApplicationContext`는 모든 공통 어노테이션 post-processors가 등록되어 있으며, `@EnableTransactionManagement`와 같은 설정 어노테이션을 통해 내부적으로 추가 processors를 가져올 수 있습니다. Spring의 어노테이션 기반 설정 모델의 추상화 레벨에서, 빈 post-processors의 개념은 단순히 내부 컨테이너 세부사항이 됩니다.
