---
title: "Container Overview"
description: "Spring IoC 컨테이너의 핵심은 `ApplicationContext` 인터페이스로, 빈(bean)의 인스턴스화, 구성, 조립을 담당한다. 컨테이너는 설정 메타데이터(configuration metadata)를 읽어 어떤 객체를 생성하고 어떻게 연결할지 결정한다. 설정 메타데이터는 애노테이션 기반 자바 클래스, `@Configuration`과 `@Bean`을 사용한 자바 설정, 또는 전통적인 XML 파일로 표현할 수 있다."
pubDate: "2026-03-10"
tags: ["Resources/translations/Spring/IoC Container"]
contentSource: "ai-assisted"
draft: true
---

# Container Overview

> 원문: [Container Overview](https://docs.spring.io/spring-framework/reference/core/beans/basics.html)

## 전문 번역

`org.springframework.context.ApplicationContext` 인터페이스는 Spring IoC 컨테이너를 나타내며, 빈(bean)의 인스턴스화(instantiating), 구성(configuring), 조립(assembling)을 책임진다. 컨테이너는 인스턴스화, 구성, 조립할 컴포넌트에 대한 지시 사항을 구성 메타데이터(configuration metadata)를 읽어서 얻는다. 구성 메타데이터는 애노테이션이 달린 컴포넌트 클래스(annotated component classes), 팩토리 메서드가 있는 구성 클래스(configuration classes with factory methods), 또는 외부 XML 파일이나 Groovy 스크립트로 표현될 수 있다. 어떤 형식을 사용하든, 애플리케이션을 구성하는 컴포넌트들과 그 사이의 풍부한 상호의존성(interdependencies)을 표현할 수 있다.

`ApplicationContext` 인터페이스의 여러 구현체가 Spring 코어의 일부로 제공된다. 독립 실행형 애플리케이션에서는 일반적으로 `AnnotationConfigApplicationContext` 또는 `ClassPathXmlApplicationContext`의 인스턴스를 생성한다.

대부분의 애플리케이션 시나리오에서는 Spring IoC 컨테이너의 인스턴스를 생성하기 위해 명시적인 사용자 코드가 필요하지 않다. 예를 들어, 일반적인 웹 애플리케이션 시나리오에서는 애플리케이션의 `web.xml` 파일에 있는 간단한 보일러플레이트 웹 디스크립터(boilerplate web descriptor) XML만으로 충분하다 (Convenient ApplicationContext Instantiation for Web Applications 참조). Spring Boot 시나리오에서는 일반적인 설정 규칙(common setup conventions)에 기반하여 애플리케이션 컨텍스트가 암묵적으로 부트스트랩된다.

다음 다이어그램은 Spring이 어떻게 작동하는지에 대한 상위 수준 뷰(high-level view)를 보여준다. 애플리케이션 클래스는 구성 메타데이터와 결합되어, `ApplicationContext`가 생성되고 초기화된 후에 완전히 구성되고 실행 가능한 시스템 또는 애플리케이션을 갖게 된다.

![container-magic](/04-Archive/ATTACHMENTS/container-magic.png)
**Figure 1. The Spring IoC container**

### Configuration Metadata (구성 메타데이터)

앞의 다이어그램에서 보여주듯이, Spring IoC 컨테이너는 하나의 형태의 구성 메타데이터를 소비(consume)한다. 이 구성 메타데이터는 애플리케이션 개발자로서 여러분이 Spring 컨테이너에게 애플리케이션의 컴포넌트를 어떻게 인스턴스화하고, 구성하고, 조립할지를 지시하는 방법을 나타낸다.

Spring IoC 컨테이너 자체는 이 구성 메타데이터가 실제로 어떤 형식으로 작성되는지와 완전히 분리(totally decoupled)되어 있다. 요즘에는 많은 개발자가 Spring 애플리케이션에 Java-based configuration을 선택한다:

- **Annotation-based configuration**: 애플리케이션의 컴포넌트 클래스에 애노테이션 기반 구성 메타데이터를 사용하여 빈을 정의한다.
- **Java-based configuration**: 애플리케이션 클래스 외부에서 Java 기반 구성 클래스를 사용하여 빈을 정의한다. 이러한 기능을 사용하려면 `@Configuration`, `@Bean`, `@Import`, `@DependsOn` 애노테이션을 참조하라.

Spring 구성은 컨테이너가 관리해야 하는 최소 하나 이상, 일반적으로는 그 이상의 빈 정의(bean definition)로 구성된다. Java 구성은 일반적으로 `@Configuration` 클래스 내에서 `@Bean` 애노테이션이 달린 메서드를 사용하며, 각 메서드는 하나의 빈 정의에 해당한다.

이러한 빈 정의는 애플리케이션을 구성하는 실제 객체에 대응한다. 일반적으로 서비스 계층 객체(service layer objects), 저장소나 데이터 액세스 객체(DAO)와 같은 퍼시스턴스 계층 객체(persistence layer objects), 웹 컨트롤러와 같은 프레젠테이션 객체(presentation objects), JPA `EntityManagerFactory`와 같은 인프라 객체(infrastructure objects), JMS 큐 등을 정의한다. 일반적으로 컨테이너에서 세분화된 도메인 객체(fine-grained domain objects)를 구성하지는 않는데, 이는 보통 리포지토리(repositories)와 비즈니스 로직(business logic)이 도메인 객체를 생성하고 로드하는 책임을 갖기 때문이다.

#### XML as an External Configuration DSL (외부 구성 DSL로서의 XML)

XML 기반 구성 메타데이터는 이러한 빈들을 최상위 `<beans/>` 요소 내부에 `<bean/>` 요소로 구성한다. 다음 예시는 XML 기반 구성 메타데이터의 기본 구조를 보여준다:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
		https://www.springframework.org/schema/beans/spring-beans.xsd">

	<bean id="..." class="..."> (1) (2)
		<!-- collaborators and configuration for this bean go here -->
	</bean>

	<bean id="..." class="...">
		<!-- collaborators and configuration for this bean go here -->
	</bean>

	<!-- more bean definitions go here -->

</beans>
```

| | |
|---|---|
| 1 | `id` 속성(attribute)은 개별 빈 정의를 식별하는 문자열이다. |
| 2 | `class` 속성은 빈의 타입을 정의하며 완전히 한정된 클래스 이름(fully qualified class name)을 사용한다. |

`id` 속성의 값은 협력 객체(collaborating objects)를 참조하는 데 사용될 수 있다. 협력 객체를 참조하는 XML은 이 예시에서는 표시되지 않았다. 더 많은 정보는 Dependencies를 참조하라.

컨테이너를 인스턴스화하기 위해, XML 리소스 파일의 위치 경로(location path)를 `ClassPathXmlApplicationContext` 생성자에 제공해야 한다. 이 생성자를 통해 컨테이너는 로컬 파일 시스템, Java `CLASSPATH` 등과 같은 다양한 외부 리소스로부터 구성 메타데이터를 로드할 수 있다.

**Java:**
```java
ApplicationContext context = new ClassPathXmlApplicationContext("services.xml", "daos.xml");
```

**Kotlin:**
```kotlin
val context = ClassPathXmlApplicationContext("services.xml", "daos.xml")
```

> **Note**
>
> Spring의 IoC 컨테이너에 대해 학습한 후, Spring의 `Resource` 추상화(Resources에 설명됨)에 대해 더 알고 싶을 수 있다. 이는 URI 구문으로 정의된 위치에서 InputStream을 읽는 편리한 메커니즘을 제공한다. 특히, `Resource` 경로는 Application Contexts and Resource Paths에 설명된 대로 애플리케이션 컨텍스트를 구성하는 데 사용된다.

다음 예시는 서비스 계층 객체 `(services.xml)` 구성 파일을 보여준다:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
		https://www.springframework.org/schema/beans/spring-beans.xsd">

	<!-- services -->

	<bean id="petStore" class="org.springframework.samples.jpetstore.services.PetStoreServiceImpl">
		<property name="accountDao" ref="accountDao"/>
		<property name="itemDao" ref="itemDao"/>
		<!-- additional collaborators and configuration for this bean go here -->
	</bean>

	<!-- more bean definitions for services go here -->

</beans>
```

다음 예시는 데이터 액세스 객체 `daos.xml` 파일을 보여준다:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
		https://www.springframework.org/schema/beans/spring-beans.xsd">

	<bean id="accountDao"
		class="org.springframework.samples.jpetstore.dao.jpa.JpaAccountDao">
		<!-- additional collaborators and configuration for this bean go here -->
	</bean>

	<bean id="itemDao" class="org.springframework.samples.jpetstore.dao.jpa.JpaItemDao">
		<!-- additional collaborators and configuration for this bean go here -->
	</bean>

	<!-- more bean definitions for data access objects go here -->

</beans>
```

앞의 예시에서 서비스 계층은 `PetStoreServiceImpl` 클래스와 `JpaAccountDao`와 `JpaItemDao` 타입의 두 개의 데이터 액세스 객체로 구성된다 (JPA Object-Relational Mapping 표준 기반). `property name` 요소는 JavaBean 속성(property)의 이름을 참조하고, `ref` 요소는 다른 빈 정의의 이름을 참조한다. `id`와 `ref` 요소 사이의 이러한 연결(linkage)은 협력 객체 간의 의존성(dependency)을 표현한다. 객체의 의존성 구성에 대한 자세한 내용은 Dependencies를 참조하라.

#### Composing XML-based Configuration Metadata (XML 기반 구성 메타데이터 구성하기)

빈 정의가 여러 XML 파일에 걸쳐 있는 것이 유용할 수 있다. 종종 각 개별 XML 구성 파일은 아키텍처의 논리적 계층(logical layer) 또는 모듈(module)을 나타낸다.

`ClassPathXmlApplicationContext` 생성자를 사용하여 XML 프래그먼트(fragments)로부터 빈 정의를 로드할 수 있다. 이 생성자는 이전 섹션에서 보았듯이 여러 `Resource` 위치를 받는다. 또는, 하나 이상의 `<import/>` 요소를 사용하여 다른 파일로부터 빈 정의를 로드할 수 있다. 다음 예시는 이를 수행하는 방법을 보여준다:

```xml
<beans>
	<import resource="services.xml"/>
	<import resource="resources/messageSource.xml"/>

	<bean id="bean1" class="..."/>
	<bean id="bean2" class="..."/>
</beans>
```

앞의 예시에서 외부 빈 정의는 `services.xml`과 `messageSource.xml` 파일로부터 로드된다. 모든 위치 경로는 import를 수행하는 정의 파일에 상대적(relative)이므로, `services.xml`은 import를 수행하는 파일과 동일한 디렉토리 또는 classpath 위치에 있어야 하고, `messageSource.xml`은 import를 수행하는 파일의 위치 아래에 있는 `resources` 위치에 있어야 한다. 보시다시피 선행 슬래시(leading slash)는 무시된다. 그러나 이러한 경로가 상대적이라는 점을 감안하면 슬래시를 전혀 사용하지 않는 것이 더 나은 형식이다. Import되는 파일의 내용은 최상위 `<beans/>` 요소를 포함하여 Spring Schema에 따라 유효한 XML 빈 정의여야 한다.

> **Note**
>
> 상대적인 "../" 경로를 사용하여 부모 디렉토리의 파일을 참조하는 것은 가능하지만 권장되지 않는다. 그렇게 하면 현재 애플리케이션 외부에 있는 파일에 대한 의존성이 생성된다. 특히 이 참조는 `"classpath:"` URL (예: `classpath:../services.xml`)에는 권장되지 않는데, 런타임 해결 프로세스가 "가장 가까운" classpath root를 선택한 다음 그 부모 디렉토리를 조사하기 때문이다. Classpath 구성 변경은 다른, 잘못된 디렉토리의 선택으로 이어질 수 있다.
>
> 상대 경로 대신 항상 완전히 한정된 리소스 위치(fully qualified resource locations)를 사용할 수 있다: 예를 들어, `file:C:/config/services.xml` 또는 `classpath:/config/services.xml`. 그러나 애플리케이션의 구성을 특정 절대 위치에 결합(coupling)하고 있다는 점을 인식해야 한다. 일반적으로 이러한 절대 위치에 대해서는 간접 참조(indirection)를 유지하는 것이 바람직하다 — 예를 들어, 런타임에 JVM 시스템 속성(system properties)에 대해 해결되는 "${…}" 플레이스홀더를 통해서이다.

네임스페이스 자체가 import 지시문 기능을 제공한다. 일반적인 빈 정의를 넘어서는 추가 구성 기능은 Spring에서 제공하는 XML 네임스페이스 선택에서 사용할 수 있다 — 예를 들어, `context`와 `util` 네임스페이스.

### Using the Container (컨테이너 사용하기)

`ApplicationContext`는 다양한 빈과 그 의존성의 레지스트리(registry)를 유지할 수 있는 고급 팩토리(advanced factory)를 위한 인터페이스이다. `T getBean(String name, Class<T> requiredType)` 메서드를 사용하여 빈의 인스턴스를 검색할 수 있다.

`ApplicationContext`를 사용하면 다음 예시에서 보여주듯이 빈 정의를 읽고 접근할 수 있다:

**Java:**
```java
// create and configure beans
ApplicationContext context = new ClassPathXmlApplicationContext("services.xml", "daos.xml");

// retrieve configured instance
PetStoreService service = context.getBean("petStore", PetStoreService.class);

// use configured instance
List<String> userList = service.getUsernameList();
```

**Kotlin:**
```kotlin
// create and configure beans
val context = ClassPathXmlApplicationContext("services.xml", "daos.xml")

// retrieve configured instance
val service = context.getBean("petStore", PetStoreService::class.java)

// use configured instance
var userList = service.getUsernameList()
```

Groovy 구성을 사용하면 부트스트랩은 매우 유사하게 보인다. Groovy를 인식하는(Groovy-aware) 다른 컨텍스트 구현 클래스가 있다 (XML 빈 정의도 이해한다). 다음 예시는 Groovy 구성을 보여준다:

**Java:**
```java
ApplicationContext context = new GenericGroovyApplicationContext("services.groovy", "daos.groovy");
```

**Kotlin:**
```kotlin
val context = GenericGroovyApplicationContext("services.groovy", "daos.groovy")
```

가장 유연한 변형(variant)은 리더 델리게이트(reader delegates)와 결합된 `GenericApplicationContext`이다 — 예를 들어, 다음 예시에서 보여주듯이 XML 파일에 대해 `XmlBeanDefinitionReader`와 함께 사용할 수 있다:

**Java:**
```java
GenericApplicationContext context = new GenericApplicationContext();
new XmlBeanDefinitionReader(context).loadBeanDefinitions("services.xml", "daos.xml");
context.refresh();
```

**Kotlin:**
```kotlin
val context = GenericApplicationContext()
XmlBeanDefinitionReader(context).loadBeanDefinitions("services.xml", "daos.xml")
context.refresh()
```

다음 예시에서 보여주듯이 Groovy 파일에 대해서는 `GroovyBeanDefinitionReader`를 사용할 수도 있다:

**Java:**
```java
GenericApplicationContext context = new GenericApplicationContext();
new GroovyBeanDefinitionReader(context).loadBeanDefinitions("services.groovy", "daos.groovy");
context.refresh();
```

**Kotlin:**
```kotlin
val context = GenericApplicationContext()
GroovyBeanDefinitionReader(context).loadBeanDefinitions("services.groovy", "daos.groovy")
context.refresh()
```

동일한 `ApplicationContext`에서 이러한 리더 델리게이트를 혼합하고 매치(mix and match)하여 다양한 구성 소스로부터 빈 정의를 읽을 수 있다.

그런 다음 `getBean`을 사용하여 빈의 인스턴스를 검색할 수 있다. `ApplicationContext` 인터페이스에는 빈을 검색하기 위한 몇 가지 다른 메서드가 있지만, 이상적으로는 애플리케이션 코드가 이를 사용해서는 안 된다. 실제로 애플리케이션 코드는 `getBean()` 메서드에 대한 호출이 전혀 없어야 하며, 따라서 Spring API에 대한 의존성이 전혀 없어야 한다. 예를 들어, Spring의 웹 프레임워크와의 통합(integration)은 컨트롤러나 JSF 관리 빈(JSF-managed beans)과 같은 다양한 웹 프레임워크 컴포넌트에 대해 의존성 주입(dependency injection)을 제공하여, 메타데이터(예: 오토와이어링 애노테이션)를 통해 특정 빈에 대한 의존성을 선언할 수 있게 한다.
