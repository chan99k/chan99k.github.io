---
title: "Container Extension Points"
description: "Spring IoC 컨테이너는 특별한 통합 인터페이스를 구현하여 확장할 수 있습니다. 주요 확장 포인트는 세 가지입니다: (1) BeanPostProcessor는 빈 인스턴스를 커스터마이징하여 초기화 전후에 로직을 삽입할 수 있고, (2) BeanFactoryPostProcessor는 빈 정의 메타데이터를 수정하여 컨테이너가 빈을 인스턴스화하기 전에 설정을 변경할 수 있으며, (3) FactoryBean은 복잡한 초기화 로직을 Java 코드로 작성하여 빈 생성 로직 자체를 커스터마이징할 수 있습니다. BeanPostProcessor는 AOP 프록시 래핑과 같은 인프라 기능을 구현하는 데 사용되며, BeanFactoryPostProcessor는 PropertySourcesPlaceholderConfigu..."
pubDate: "2026-03-10"
tags: ["Resources/translations/spring/core/ioc-container"]
contentSource: "ai-assisted"
draft: false
---

# Container Extension Points

> 원문: [Container Extension Points](https://docs.spring.io/spring-framework/reference/core/beans/factory-extension.html)

## 전문 번역

# Container Extension Points (컨테이너 확장 포인트)

일반적으로 애플리케이션 개발자는 `ApplicationContext` 구현 클래스를 서브클래싱할 필요가 없습니다. 대신, Spring IoC 컨테이너는 특별한 통합 인터페이스(integration interface)의 구현을 플러그인하여 확장할 수 있습니다. 다음 몇 섹션에서는 이러한 통합 인터페이스를 설명합니다.

## Customizing Beans by Using a BeanPostProcessor (BeanPostProcessor를 사용하여 빈 커스터마이징)

`BeanPostProcessor` 인터페이스는 자신만의 (또는 컨테이너의 기본값을 오버라이드하는) 인스턴스화 로직(instantiation logic), 의존성 해결 로직(dependency resolution logic) 등을 제공하기 위해 구현할 수 있는 콜백 메서드(callback method)를 정의합니다. Spring 컨테이너가 빈을 인스턴스화, 설정, 초기화한 후에 일부 커스텀 로직을 구현하고 싶다면, 하나 이상의 커스텀 `BeanPostProcessor` 구현을 플러그인할 수 있습니다.

여러 `BeanPostProcessor` 인스턴스를 설정할 수 있으며, `order` 프로퍼티를 설정하여 이러한 `BeanPostProcessor` 인스턴스가 실행되는 순서를 제어할 수 있습니다. 이 프로퍼티는 `BeanPostProcessor`가 `Ordered` 인터페이스를 구현한 경우에만 설정할 수 있습니다. 자신만의 `BeanPostProcessor`를 작성한다면, `Ordered` 인터페이스를 구현하는 것도 고려해야 합니다. 자세한 내용은 [`BeanPostProcessor`](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/beans/factory/config/BeanPostProcessor.html)와 [`Ordered`](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/core/Ordered.html) 인터페이스의 javadoc을 참조하세요. [`BeanPostProcessor` 인스턴스의 프로그래밍 방식 등록](#programmatic-registration)에 대한 참고 사항도 확인하세요.

> **Note**:
>
> `BeanPostProcessor` 인스턴스는 빈(또는 객체) 인스턴스에서 작동합니다. 즉, Spring IoC 컨테이너가 빈 인스턴스를 인스턴스화한 다음 `BeanPostProcessor` 인스턴스가 작업을 수행합니다.
>
> `BeanPostProcessor` 인스턴스는 컨테이너별로 범위가 지정됩니다(scoped per-container). 이는 컨테이너 계층 구조(container hierarchies)를 사용하는 경우에만 관련이 있습니다. 한 컨테이너에 `BeanPostProcessor`를 정의하면, 해당 컨테이너의 빈만 후처리합니다. 즉, 한 컨테이너에 정의된 빈은 다른 컨테이너에 정의된 `BeanPostProcessor`에 의해 후처리되지 않습니다. 두 컨테이너가 동일한 계층 구조의 일부인 경우에도 마찬가지입니다.
>
> 실제 빈 정의(즉, 빈을 정의하는 청사진(blueprint))를 변경하려면, 대신 `BeanFactoryPostProcessor`를 사용해야 합니다. 이는 [BeanFactoryPostProcessor를 사용하여 설정 메타데이터 커스터마이징](#customizing-configuration-metadata-with-a-beanfactorypostprocessor)에서 설명합니다.

`org.springframework.beans.factory.config.BeanPostProcessor` 인터페이스는 정확히 두 개의 콜백 메서드로 구성됩니다. 이러한 클래스가 컨테이너에 후처리기(post-processor)로 등록되면, 컨테이너가 생성하는 각 빈 인스턴스에 대해, 후처리기는 컨테이너 초기화 메서드(예: `InitializingBean.afterPropertiesSet()` 또는 선언된 `init` 메서드)가 호출되기 전과 빈 초기화 콜백 후 모두에서 컨테이너로부터 콜백을 받습니다. 후처리기는 빈 인스턴스에 대해 콜백을 완전히 무시하는 것을 포함하여 모든 작업을 수행할 수 있습니다. 빈 후처리기는 일반적으로 콜백 인터페이스를 확인하거나 빈을 프록시로 래핑할 수 있습니다. 일부 Spring AOP 인프라 클래스는 프록시 래핑 로직을 제공하기 위해 빈 후처리기로 구현됩니다.

`ApplicationContext`는 설정 메타데이터에 정의되어 `BeanPostProcessor` 인터페이스를 구현하는 모든 빈을 자동으로 감지합니다. `ApplicationContext`는 이러한 빈을 후처리기로 등록하여 나중에 빈 생성 시 호출될 수 있도록 합니다. 빈 후처리기는 다른 빈과 동일한 방식으로 컨테이너에 배포될 수 있습니다.

설정 클래스에서 `@Bean` 팩토리 메서드를 사용하여 `BeanPostProcessor`를 선언할 때, 팩토리 메서드의 반환 타입은 구현 클래스 자체이거나 최소한 `org.springframework.beans.factory.config.BeanPostProcessor` 인터페이스여야 하며, 해당 빈의 후처리기 특성을 명확하게 나타내야 합니다. 그렇지 않으면, `ApplicationContext`는 완전히 생성하기 전에 타입별로 자동 감지할 수 없습니다. `BeanPostProcessor`는 컨텍스트의 다른 빈의 초기화에 적용하기 위해 일찍 인스턴스화되어야 하므로, 이러한 조기 타입 감지가 중요합니다.

> **Note**:
>
> **BeanPostProcessor 인스턴스의 프로그래밍 방식 등록**
>
> `BeanPostProcessor` 등록을 위한 권장 접근 방식은 `ApplicationContext` 자동 감지(앞서 설명한 대로)를 통하는 것이지만, `addBeanPostProcessor` 메서드를 사용하여 `ConfigurableBeanFactory`에 대해 프로그래밍 방식으로 등록할 수도 있습니다. 이는 등록 전에 조건부 로직을 평가해야 하거나 계층 구조의 컨텍스트 간에 빈 후처리기를 복사해야 할 때 유용할 수 있습니다. 그러나 프로그래밍 방식으로 추가된 `BeanPostProcessor` 인스턴스는 `Ordered` 인터페이스를 존중하지 않습니다. 여기서는 등록 순서가 실행 순서를 결정합니다. 또한 프로그래밍 방식으로 등록된 `BeanPostProcessor` 인스턴스는 명시적 순서와 관계없이 자동 감지를 통해 등록된 인스턴스보다 항상 먼저 처리됩니다.

> **Note**:
>
> **BeanPostProcessor 인스턴스와 AOP 자동 프록싱**
>
> `BeanPostProcessor` 인터페이스를 구현하는 클래스는 특별하며 컨테이너에 의해 다르게 처리됩니다. 모든 `BeanPostProcessor` 인스턴스와 이들이 직접 참조하는 빈은 `ApplicationContext`의 특별한 시작 단계의 일부로 시작 시 인스턴스화됩니다. 다음으로, 모든 `BeanPostProcessor` 인스턴스가 정렬된 방식으로 등록되고 컨테이너의 모든 추가 빈에 적용됩니다. AOP 자동 프록싱(auto-proxying)은 `BeanPostProcessor` 자체로 구현되므로, `BeanPostProcessor` 인스턴스나 이들이 직접 참조하는 빈은 자동 프록싱 대상이 아니며, 따라서 애스펙트(aspect)가 위빙(woven)되지 않습니다.
>
> 이러한 빈의 경우, 정보 로그 메시지가 표시됩니다: `Bean someBean is not eligible for getting processed by all BeanPostProcessor interfaces (for example: not eligible for auto-proxying)`.
>
> 자동 와이어링(autowiring) 또는 `@Resource`(자동 와이어링으로 폴백될 수 있음)를 사용하여 빈을 `BeanPostProcessor`에 와이어링하는 경우, Spring은 타입 매칭 의존성 후보를 검색할 때 예기치 않은 빈에 액세스할 수 있으므로, 자동 프록싱 또는 다른 종류의 빈 후처리에 부적격하게 만들 수 있습니다. 예를 들어, `@Resource`로 주석이 달린 의존성이 있고 필드 또는 setter 이름이 빈의 선언된 이름과 직접 일치하지 않고 name 속성이 사용되지 않은 경우, Spring은 타입별로 매칭하기 위해 다른 빈에 액세스합니다.

다음 예제는 `ApplicationContext`에서 `BeanPostProcessor` 인스턴스를 작성, 등록 및 사용하는 방법을 보여줍니다.

### Example: Hello World, BeanPostProcessor-style (예제: Hello World, BeanPostProcessor 스타일)

첫 번째 예제는 기본 사용법을 보여줍니다. 이 예제는 컨테이너가 생성할 때 각 빈의 `toString()` 메서드를 호출하고 결과 문자열을 시스템 콘솔에 출력하는 커스텀 `BeanPostProcessor` 구현을 보여줍니다.

다음 목록은 커스텀 `BeanPostProcessor` 구현 클래스 정의를 보여줍니다:

```java
package scripting;

import org.springframework.beans.factory.config.BeanPostProcessor;

public class InstantiationTracingBeanPostProcessor implements BeanPostProcessor {

	// simply return the instantiated bean as-is
	public Object postProcessBeforeInitialization(Object bean, String beanName) {
		return bean; // we could potentially return any object reference here...
	}

	public Object postProcessAfterInitialization(Object bean, String beanName) {
		System.out.println("Bean '" + beanName + "' created : " + bean.toString());
		return bean;
	}
}
```

다음 `beans` 엘리먼트는 `InstantiationTracingBeanPostProcessor`를 사용합니다:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:lang="http://www.springframework.org/schema/lang"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
		https://www.springframework.org/schema/beans/spring-beans.xsd
		http://www.springframework.org/schema/lang
		https://www.springframework.org/schema/lang/spring-lang.xsd">

	<lang:groovy id="messenger"
			script-source="classpath:org/springframework/scripting/groovy/Messenger.groovy">
		<lang:property name="message" value="Fiona Apple Is Just So Dreamy."/>
	</lang:groovy>

	<!--
	when the above bean (messenger) is instantiated, this custom
	BeanPostProcessor implementation will output the fact to the system console
	-->
	<bean class="scripting.InstantiationTracingBeanPostProcessor"/>

</beans>
```

`InstantiationTracingBeanPostProcessor`가 단순히 정의되어 있음을 주목하세요. 이름조차 없으며, 빈이기 때문에 다른 빈과 마찬가지로 의존성 주입될 수 있습니다. (앞의 설정은 Groovy 스크립트로 백업되는 빈도 정의합니다.)

다음 Java 애플리케이션은 앞의 코드와 설정을 실행합니다:

```java
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.scripting.Messenger;

public final class Boot {

	public static void main(final String[] args) throws Exception {
		ApplicationContext ctx = new ClassPathXmlApplicationContext("scripting/beans.xml");
		Messenger messenger = ctx.getBean("messenger", Messenger.class);
		System.out.println(messenger);
	}

}
```

앞의 애플리케이션의 출력은 다음과 유사합니다:

```
Bean 'messenger' created : org.springframework.scripting.groovy.GroovyMessenger@272961
org.springframework.scripting.groovy.GroovyMessenger@272961
```

### Example: The AutowiredAnnotationBeanPostProcessor (예제: AutowiredAnnotationBeanPostProcessor)

커스텀 `BeanPostProcessor` 구현과 함께 콜백 인터페이스 또는 어노테이션을 사용하는 것은 Spring IoC 컨테이너를 확장하는 일반적인 수단입니다. 예를 들어 Spring의 `AutowiredAnnotationBeanPostProcessor`는 Spring 배포판과 함께 제공되는 `BeanPostProcessor` 구현으로, 어노테이션이 달린 필드, setter 메서드 및 임의의 설정 메서드를 자동 와이어링합니다.

## Customizing Configuration Metadata with a BeanFactoryPostProcessor (BeanFactoryPostProcessor를 사용하여 설정 메타데이터 커스터마이징)

다음으로 살펴볼 확장 포인트는 `org.springframework.beans.factory.config.BeanFactoryPostProcessor`입니다. 이 인터페이스의 의미는 `BeanPostProcessor`의 의미와 유사하지만, 한 가지 주요 차이점이 있습니다: `BeanFactoryPostProcessor`는 빈 설정 메타데이터에서 작동합니다. 즉, Spring IoC 컨테이너는 `BeanFactoryPostProcessor`가 설정 메타데이터를 읽고 `BeanFactoryPostProcessor` 인스턴스 이외의 다른 빈을 컨테이너가 인스턴스화하기 *전에* 잠재적으로 변경할 수 있도록 합니다.

여러 `BeanFactoryPostProcessor` 인스턴스를 설정할 수 있으며, `order` 프로퍼티를 설정하여 이러한 `BeanFactoryPostProcessor` 인스턴스가 실행되는 순서를 제어할 수 있습니다. 그러나 `BeanFactoryPostProcessor`가 `Ordered` 인터페이스를 구현한 경우에만 이 프로퍼티를 설정할 수 있습니다. 자신만의 `BeanFactoryPostProcessor`를 작성한다면, `Ordered` 인터페이스를 구현하는 것도 고려해야 합니다. 자세한 내용은 [`BeanFactoryPostProcessor`](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/beans/factory/config/BeanFactoryPostProcessor.html)와 [`Ordered`](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/core/Ordered.html) 인터페이스의 javadoc을 참조하세요.

> **Note**:
>
> 실제 빈 인스턴스(즉, 설정 메타데이터로부터 생성된 객체)를 변경하려면, 대신 `BeanPostProcessor`를 사용해야 합니다(앞서 [BeanPostProcessor를 사용하여 빈 커스터마이징](#customizing-beans-by-using-a-beanpostprocessor)에서 설명). `BeanFactoryPostProcessor` 내에서 빈 인스턴스를 작업하는 것이 기술적으로 가능하지만(예: `BeanFactory.getBean()`을 사용하여), 그렇게 하면 조기 빈 인스턴스화(premature bean instantiation)를 유발하여 표준 컨테이너 라이프사이클을 위반합니다. 이는 빈 후처리를 우회하는 것과 같은 부정적인 부작용을 야기할 수 있습니다.
>
> 또한 `BeanFactoryPostProcessor` 인스턴스는 컨테이너별로 범위가 지정됩니다. 이는 컨테이너 계층 구조를 사용하는 경우에만 관련이 있습니다. 한 컨테이너에 `BeanFactoryPostProcessor`를 정의하면, 해당 컨테이너의 빈 정의에만 적용됩니다. 한 컨테이너의 빈 정의는 다른 컨테이너의 `BeanFactoryPostProcessor` 인스턴스에 의해 후처리되지 않습니다. 두 컨테이너가 동일한 계층 구조의 일부인 경우에도 마찬가지입니다.

빈 팩토리 후처리기는 `ApplicationContext` 내부에 선언되면 자동으로 실행되어 컨테이너를 정의하는 설정 메타데이터에 변경 사항을 적용합니다. Spring에는 `PropertyOverrideConfigurer` 및 `PropertySourcesPlaceholderConfigurer`와 같은 여러 사전 정의된 빈 팩토리 후처리기가 포함되어 있습니다. 커스텀 `BeanFactoryPostProcessor`를 사용할 수도 있습니다. 예를 들어 커스텀 프로퍼티 편집기를 등록하는 데 사용할 수 있습니다.

`ApplicationContext`는 `BeanFactoryPostProcessor` 인터페이스를 구현하는 배포된 모든 빈을 자동으로 감지합니다. 적절한 시점에 이러한 빈을 빈 팩토리 후처리기로 사용합니다. 이러한 후처리기 빈을 다른 빈과 마찬가지로 배포할 수 있습니다.

> **Note**:
>
> `BeanPostProcessor`와 마찬가지로, 일반적으로 `BeanFactoryPostProcessor`를 지연 초기화(lazy initialization)로 설정하지 않습니다. 다른 빈이 `Bean(Factory)PostProcessor`를 참조하지 않으면, 해당 후처리기는 전혀 인스턴스화되지 않습니다. 따라서 지연 초기화로 표시해도 무시되며, `<beans />` 엘리먼트의 선언에서 `default-lazy-init` 속성을 `true`로 설정하더라도 `Bean(Factory)PostProcessor`는 즉시 인스턴스화됩니다.

### Example: Property Placeholder Substitution with PropertySourcesPlaceholderConfigurer (예제: PropertySourcesPlaceholderConfigurer를 사용한 프로퍼티 플레이스홀더 치환)

`PropertySourcesPlaceholderConfigurer`를 사용하여 표준 Java `Properties` 형식을 사용하여 별도의 파일에서 빈 정의의 프로퍼티 값을 외부화할 수 있습니다. 이렇게 하면 애플리케이션을 배포하는 사람이 컨테이너의 주 XML 정의 파일을 수정하는 복잡성이나 위험 없이 데이터베이스 URL 및 비밀번호와 같은 환경별 프로퍼티를 커스터마이징할 수 있습니다.

플레이스홀더 값이 정의된 `DataSource`가 정의된 다음 XML 기반 설정 메타데이터 조각을 고려하세요:

```xml
<bean class="org.springframework.context.support.PropertySourcesPlaceholderConfigurer">
	<property name="locations" value="classpath:com/something/jdbc.properties"/>
</bean>

<bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource" destroy-method="close">
	<property name="driverClassName" value="${jdbc.driverClassName}"/>
	<property name="url" value="${jdbc.url}"/>
	<property name="username" value="${jdbc.username}"/>
	<property name="password" value="${jdbc.password}"/>
</bean>
```

이 예제는 외부 `Properties` 파일에서 설정된 프로퍼티를 보여줍니다. 런타임에 `PropertySourcesPlaceholderConfigurer`가 `DataSource`의 일부 프로퍼티를 대체하는 메타데이터에 적용됩니다. 대체할 값은 Ant, log4j 및 JSP EL 스타일을 따르는 `${property-name}` 형식의 플레이스홀더로 지정됩니다.

실제 값은 표준 Java `Properties` 형식의 다른 파일에서 가져옵니다:

```
jdbc.driverClassName=org.hsqldb.jdbcDriver
jdbc.url=jdbc:hsqldb:hsql://production:9002
jdbc.username=sa
jdbc.password=root
```

따라서 `${jdbc.username}` 문자열은 런타임에 'sa' 값으로 대체되며, 프로퍼티 파일의 키와 일치하는 다른 플레이스홀더 값에도 동일하게 적용됩니다. `PropertySourcesPlaceholderConfigurer`는 빈 정의의 대부분의 프로퍼티와 속성에서 플레이스홀더를 확인합니다. 또한 플레이스홀더 접두사(prefix), 접미사(suffix), 기본값 구분자(default value separator) 및 이스케이프 문자(escape character)를 커스터마이징할 수 있습니다. 또한 JVM 시스템 프로퍼티를 통해(또는 [`SpringProperties`](../../appendix.html#appendix-spring-properties) 메커니즘을 통해) `spring.placeholder.escapeCharacter.default` 프로퍼티를 설정하여 기본 이스케이프 문자를 전역적으로 변경하거나 비활성화할 수 있습니다.

`context` 네임스페이스를 사용하면, 전용 설정 엘리먼트로 프로퍼티 플레이스홀더를 설정할 수 있습니다. 다음 예제와 같이 `location` 속성에 쉼표로 구분된 목록으로 하나 이상의 위치를 제공할 수 있습니다:

```xml
<context:property-placeholder location="classpath:com/something/jdbc.properties"/>
```

`PropertySourcesPlaceholderConfigurer`는 지정한 `Properties` 파일에서만 프로퍼티를 찾지 않습니다. 기본적으로 지정된 프로퍼티 파일에서 프로퍼티를 찾을 수 없으면, Spring `Environment` 프로퍼티와 일반 Java `System` 프로퍼티를 확인합니다.

> **Warning**:
>
> 필요한 프로퍼티를 가진 주어진 애플리케이션에 대해 이러한 엘리먼트 중 하나만 정의해야 합니다. 여러 프로퍼티 플레이스홀더는 고유한 플레이스홀더 구문(`${…​}`)을 갖는 한 설정할 수 있습니다.
>
> 대체에 사용되는 프로퍼티 소스를 모듈화해야 하는 경우, 여러 프로퍼티 플레이스홀더를 생성해서는 안 됩니다. 오히려 사용할 프로퍼티를 수집하는 자체 `PropertySourcesPlaceholderConfigurer` 빈을 생성해야 합니다.

> **Tip**:
>
> `PropertySourcesPlaceholderConfigurer`를 사용하여 클래스 이름을 치환할 수 있습니다. 이는 런타임에 특정 구현 클래스를 선택해야 할 때 유용합니다. 다음 예제는 이를 수행하는 방법을 보여줍니다:
>
> ```xml
> <bean class="org.springframework.beans.factory.config.PropertySourcesPlaceholderConfigurer">
> 	<property name="locations">
> 		<value>classpath:com/something/strategy.properties</value>
> 	</property>
> 	<property name="properties">
> 		<value>custom.strategy.class=com.something.DefaultStrategy</value>
> 	</property>
> </bean>
>
> <bean id="serviceStrategy" class="${custom.strategy.class}"/>
> ```
>
> 런타임에 클래스를 유효한 클래스로 해결할 수 없으면, non-lazy-init 빈의 경우 `ApplicationContext`의 `preInstantiateSingletons()` 단계 중 생성하려고 할 때 빈 해결이 실패합니다.

### Example: The PropertyOverrideConfigurer (예제: PropertyOverrideConfigurer)

또 다른 빈 팩토리 후처리기인 `PropertyOverrideConfigurer`는 `PropertySourcesPlaceholderConfigurer`와 유사하지만, 후자와 달리 원래 정의는 빈 프로퍼티에 대한 기본값 또는 값이 전혀 없을 수 있습니다. 오버라이딩 `Properties` 파일에 특정 빈 프로퍼티에 대한 항목이 없으면, 기본 컨텍스트 정의가 사용됩니다.

빈 정의는 오버라이드되고 있다는 것을 인식하지 못하므로, XML 정의 파일에서 오버라이드 설정자가 사용되고 있다는 것이 즉시 명확하지 않습니다. 동일한 빈 프로퍼티에 대해 서로 다른 값을 정의하는 여러 `PropertyOverrideConfigurer` 인스턴스의 경우, 오버라이드 메커니즘으로 인해 마지막 인스턴스가 우선합니다.

프로퍼티 파일 설정 라인은 다음 형식을 취합니다:

```
beanName.property=value
```

다음 목록은 형식의 예를 보여줍니다:

```
dataSource.driverClassName=com.mysql.jdbc.Driver
dataSource.url=jdbc:mysql:mydb
```

이 예제 파일은 `driverClassName` 및 `url` 프로퍼티를 가진 `dataSource`라는 빈을 포함하는 컨테이너 정의와 함께 사용할 수 있습니다.

복합 프로퍼티 이름(compound property name)도 지원됩니다. 오버라이드되는 최종 프로퍼티를 제외한 경로의 모든 구성 요소가 이미 null이 아닌 경우(아마도 생성자에 의해 초기화됨)에 한합니다. 다음 예에서는 `tom` 빈의 `fred` 프로퍼티의 `bob` 프로퍼티의 `sammy` 프로퍼티가 스칼라 값 `123`으로 설정됩니다:

```
tom.fred.bob.sammy=123
```

> **Note**:
>
> 지정된 오버라이드 값은 항상 리터럴 값입니다. 빈 참조로 변환되지 않습니다. 이 규칙은 XML 빈 정의의 원래 값이 빈 참조를 지정하는 경우에도 적용됩니다.

Spring 2.5에서 도입된 `context` 네임스페이스를 사용하면, 다음 예제와 같이 전용 설정 엘리먼트로 프로퍼티 오버라이딩을 설정할 수 있습니다:

```xml
<context:property-override location="classpath:override.properties"/>
```

## Customizing Instantiation Logic with a FactoryBean (FactoryBean을 사용하여 인스턴스화 로직 커스터마이징)

자체적으로 팩토리인 객체에 대해 `org.springframework.beans.factory.FactoryBean` 인터페이스를 구현할 수 있습니다.

`FactoryBean` 인터페이스는 Spring IoC 컨테이너의 인스턴스화 로직에 대한 플러그 가능성 포인트(point of pluggability)입니다. (잠재적으로) 장황한 양의 XML보다 Java로 더 잘 표현되는 복잡한 초기화 코드가 있는 경우, 자신만의 `FactoryBean`을 생성하고, 해당 클래스 내부에 복잡한 초기화를 작성한 다음, 커스텀 `FactoryBean`을 컨테이너에 플러그인할 수 있습니다.

`FactoryBean<T>` 인터페이스는 세 가지 메서드를 제공합니다:

- `T getObject()`: 이 팩토리가 생성하는 객체의 인스턴스를 반환합니다. 인스턴스는 이 팩토리가 싱글톤을 반환하는지 프로토타입을 반환하는지에 따라 공유될 수 있습니다.
- `boolean isSingleton()`: 이 `FactoryBean`이 싱글톤을 반환하면 `true`를, 그렇지 않으면 `false`를 반환합니다. 이 메서드의 기본 구현은 `true`를 반환합니다.
- `Class<?> getObjectType()`: `getObject()` 메서드가 반환하는 객체 타입을 반환하거나, 타입을 미리 알 수 없는 경우 `null`을 반환합니다.

`FactoryBean` 개념과 인터페이스는 Spring Framework 내의 여러 곳에서 사용됩니다. `FactoryBean` 인터페이스의 50개 이상의 구현이 Spring 자체와 함께 제공됩니다.

컨테이너에 빈이 생성하는 빈 대신 실제 `FactoryBean` 인스턴스 자체를 요청해야 하는 경우, `ApplicationContext`의 `getBean()` 메서드를 호출할 때 빈의 `id` 앞에 앰퍼샌드 기호(`&`)를 붙입니다. 따라서 `id`가 `myBean`인 주어진 `FactoryBean`의 경우, 컨테이너에서 `getBean("myBean")`을 호출하면 `FactoryBean`의 생성물이 반환되는 반면, `getBean("&myBean")`을 호출하면 `FactoryBean` 인스턴스 자체가 반환됩니다.
