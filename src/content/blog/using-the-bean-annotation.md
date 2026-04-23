---
title: "Using the @Bean Annotation"
description: "이 문서는 Spring Framework의 `@Bean` 애노테이션에 대한 공식 레퍼런스로, Java 기반 설정을 사용하여 빈(bean)을 정의하고 관리하는 방법을 다룹니다. `@Bean`은 메서드 레벨 애노테이션으로 XML의 `<bean/>` 요소와 동등한 기능을 제공하며, `@Configuration` 또는 `@Component` 클래스에서 사용할 수 있습니다. 주요 내용으로는 빈 선언 방법, 의존성 주입, 라이프사이클 콜백 처리, 빈 스코프 지정, 이름 커스터마이징 등을 포함합니다."
pubDate: "2026-03-10"
tags: ["Resources/translations/spring/core/ioc-container"]
contentSource: "ai-assisted"
series: "Spring IoC Container"
seriesOrder: 17
draft: false
---

# Using the @Bean Annotation

> 원문: [Using the @Bean Annotation](https://docs.spring.io/spring-framework/reference/core/beans/java/bean-annotation.html)

## 전문 번역

### Using the @Bean Annotation (@Bean 애노테이션 사용하기)

`@Bean`은 메서드 레벨 애노테이션이며 XML `<bean/>` 요소의 직접적인 유사체입니다. 이 애노테이션은 `<bean/>`이 제공하는 속성 중 일부를 지원합니다:

- `init-method`
- `destroy-method`
- `autowiring`
- `name`

`@Bean` 애노테이션은 `@Configuration` 애노테이션이 적용된 클래스 또는 `@Component` 애노테이션이 적용된 클래스에서 사용할 수 있습니다.

### Declaring a Bean (빈 선언하기)

빈을 선언하려면 `@Bean` 애노테이션으로 메서드를 애노테이트할 수 있습니다. 이 메서드를 사용하여 메서드의 반환 값으로 지정된 타입의 `ApplicationContext` 내에 빈 정의를 등록합니다. 기본적으로 빈 이름은 메서드 이름과 동일합니다. 다음 예제는 `@Bean` 메서드 선언을 보여줍니다:

**Java:**

```java
@Configuration
public class AppConfig {

	@Bean
	public TransferServiceImpl transferService() {
		return new TransferServiceImpl();
	}
}
```

**Kotlin:**

```kotlin
@Configuration
class AppConfig {

	@Bean
	fun transferService() = TransferServiceImpl()
}
```

앞의 설정은 다음 Spring XML과 정확히 동등합니다:

```xml
<beans>
	<bean id="transferService" class="com.acme.TransferServiceImpl"/>
</beans>
```

두 선언 모두 `ApplicationContext`에서 `transferService`라는 이름의 빈을 사용 가능하게 만들며, 다음 텍스트 이미지가 보여주는 것처럼 `TransferServiceImpl` 타입의 객체 인스턴스에 바인딩됩니다:

```
transferService -> com.acme.TransferServiceImpl
```

기본 메서드(default methods)를 사용하여 빈을 정의할 수도 있습니다. 이를 통해 기본 메서드에서 빈 정의를 제공하는 인터페이스를 구현하여 빈 설정을 구성할 수 있습니다.

**Java:**

```java
public interface BaseConfig {

	@Bean
	default TransferServiceImpl transferService() {
		return new TransferServiceImpl();
	}
}

@Configuration
public class AppConfig implements BaseConfig {

}
```

또한 다음 예제가 보여주는 것처럼 인터페이스(또는 기본 클래스) 반환 타입으로 `@Bean` 메서드를 선언할 수도 있습니다:

**Java:**

```java
@Configuration
public class AppConfig {

	@Bean
	public TransferService transferService() {
		return new TransferServiceImpl();
	}
}
```

**Kotlin:**

```kotlin
@Configuration
class AppConfig {

	@Bean
	fun transferService(): TransferService {
		return TransferServiceImpl()
	}
}
```

그러나 이는 사전 타입 예측(advance type prediction)에 대한 가시성을 지정된 인터페이스 타입(`TransferService`)으로 제한합니다. 그런 다음 영향을 받는 싱글톤 빈이 인스턴스화된 후에만 컨테이너가 전체 타입(`TransferServiceImpl`)을 알게 됩니다. Non-lazy 싱글톤 빈은 선언 순서에 따라 인스턴스화되므로, 다른 컴포넌트가 선언되지 않은 타입(예: `@Autowired TransferServiceImpl`, `transferService` 빈이 인스턴스화된 후에만 해결됨)으로 매칭을 시도할 때 서로 다른 타입 매칭 결과를 볼 수 있습니다.

선언된 서비스 인터페이스로 타입을 일관되게 참조한다면, `@Bean` 반환 타입은 안전하게 그 설계 결정에 합류할 수 있습니다. 그러나 여러 인터페이스를 구현하는 컴포넌트나 구현 타입으로 잠재적으로 참조될 수 있는 컴포넌트의 경우, 가능한 가장 구체적인 반환 타입을 선언하는 것이 더 안전합니다(최소한 빈을 참조하는 주입 지점에서 요구하는 만큼 구체적으로).

### Bean Dependencies (빈 의존성)

`@Bean` 애노테이션이 적용된 메서드는 해당 빈을 빌드하는 데 필요한 의존성을 설명하는 임의의 수의 매개변수를 가질 수 있습니다. 예를 들어, `TransferService`가 `AccountRepository`를 필요로 하는 경우, 다음 예제가 보여주는 것처럼 메서드 매개변수를 사용하여 해당 의존성을 구체화할 수 있습니다:

**Java:**

```java
@Configuration
public class AppConfig {

	@Bean
	public TransferService transferService(AccountRepository accountRepository) {
		return new TransferServiceImpl(accountRepository);
	}
}
```

**Kotlin:**

```kotlin
@Configuration
class AppConfig {

	@Bean
	fun transferService(accountRepository: AccountRepository): TransferService {
		return TransferServiceImpl(accountRepository)
	}
}
```

해결(resolution) 메커니즘은 생성자 기반 의존성 주입(constructor-based dependency injection)과 거의 동일합니다. 자세한 내용은 관련 섹션을 참조하세요.

### Receiving Lifecycle Callbacks (라이프사이클 콜백 수신)

`@Bean` 애노테이션으로 정의된 모든 클래스는 정규 라이프사이클 콜백을 지원하며 JSR-250의 `@PostConstruct` 및 `@PreDestroy` 애노테이션을 사용할 수 있습니다. 자세한 내용은 JSR-250 annotations를 참조하세요.

정규 Spring 라이프사이클 콜백도 완전히 지원됩니다. 빈이 `InitializingBean`, `DisposableBean`, 또는 `Lifecycle`을 구현하면 컨테이너가 해당 메서드를 호출합니다.

`*Aware` 인터페이스의 표준 세트(예: `BeanFactoryAware`, `BeanNameAware`, `MessageSourceAware`, `ApplicationContextAware` 등)도 완전히 지원됩니다.

`@Bean` 애노테이션은 다음 예제가 보여주는 것처럼 Spring XML의 `bean` 요소에 대한 `init-method` 및 `destroy-method` 속성과 마찬가지로 임의의 초기화(initialization) 및 소멸(destruction) 콜백 메서드 지정을 지원합니다:

**Java:**

```java
public class BeanOne {

	public void init() {
		// initialization logic
	}
}

public class BeanTwo {

	public void cleanup() {
		// destruction logic
	}
}

@Configuration
public class AppConfig {

	@Bean(initMethod = "init")
	public BeanOne beanOne() {
		return new BeanOne();
	}

	@Bean(destroyMethod = "cleanup")
	public BeanTwo beanTwo() {
		return new BeanTwo();
	}
}
```

**Kotlin:**

```kotlin
class BeanOne {

	fun init() {
		// initialization logic
	}
}

class BeanTwo {

	fun cleanup() {
		// destruction logic
	}
}

@Configuration
class AppConfig {

	@Bean(initMethod = "init")
	fun beanOne() = BeanOne()

	@Bean(destroyMethod = "cleanup")
	fun beanTwo() = BeanTwo()
}
```

기본적으로 Java 설정으로 정의된 빈 중 public `close` 또는 `shutdown` 메서드가 있는 경우, 소멸 콜백(destruction callback)에 자동으로 등록됩니다. public `close` 또는 `shutdown` 메서드가 있지만 컨테이너가 종료될 때 호출되지 않기를 원하는 경우, 기본(추론된) 모드를 비활성화하기 위해 빈 정의에 `@Bean(destroyMethod = "")`를 추가할 수 있습니다.

JNDI로 획득한 리소스의 경우 해당 라이프사이클이 애플리케이션 외부에서 관리되므로 기본적으로 이렇게 하고 싶을 수 있습니다. 특히, Jakarta EE 애플리케이션 서버에서 문제가 있는 것으로 알려진 `DataSource`의 경우 항상 이렇게 해야 합니다.

다음 예제는 `DataSource`에 대한 자동 소멸 콜백을 방지하는 방법을 보여줍니다:

**Java:**

```java
@Bean(destroyMethod = "")
public DataSource dataSource() throws NamingException {
	return (DataSource) jndiTemplate.lookup("MyDS");
}
```

**Kotlin:**

```kotlin
@Bean(destroyMethod = "")
fun dataSource(): DataSource {
	return jndiTemplate.lookup("MyDS") as DataSource
}
```

또한, `@Bean` 메서드를 사용하면 일반적으로 Spring의 `JndiTemplate` 또는 `JndiLocatorDelegate` 헬퍼를 사용하거나 직접 JNDI `InitialContext` 사용을 통해 프로그래밍 방식의 JNDI 조회를 사용하지만, `JndiObjectFactoryBean` 변형은 사용하지 않습니다(이는 반환 타입을 실제 대상 타입 대신 `FactoryBean` 타입으로 선언하도록 강제하여, 여기서 제공된 리소스를 참조하려는 다른 `@Bean` 메서드에서의 교차 참조 호출에 사용하기 어렵게 만듭니다).

앞의 주석에 있는 `BeanOne`의 경우, 다음 예제가 보여주는 것처럼 생성 중에 `init()` 메서드를 직접 호출하는 것이 똑같이 유효합니다:

**Java:**

```java
@Configuration
public class AppConfig {

	@Bean
	public BeanOne beanOne() {
		BeanOne beanOne = new BeanOne();
		beanOne.init();
		return beanOne;
	}

	// ...
}
```

**Kotlin:**

```kotlin
@Configuration
class AppConfig {

	@Bean
	fun beanOne() = BeanOne().apply {
		init()
	}

	// ...
}
```

> Java에서 직접 작업하는 경우, 객체로 원하는 모든 작업을 수행할 수 있으며 항상 컨테이너 라이프사이클에 의존할 필요는 없습니다.

### Specifying Bean Scope (빈 스코프 지정)

Spring은 빈의 스코프를 지정할 수 있도록 `@Scope` 애노테이션을 포함합니다.

#### Using the @Scope Annotation (@Scope 애노테이션 사용)

`@Bean` 애노테이션으로 정의된 빈이 특정 스코프를 가져야 한다고 지정할 수 있습니다. Bean Scopes 섹션에 지정된 표준 스코프를 사용할 수 있습니다.

기본 스코프는 `singleton`이지만, 다음 예제가 보여주는 것처럼 `@Scope` 애노테이션으로 이를 재정의할 수 있습니다:

**Java:**

```java
@Configuration
public class MyConfiguration {

	@Bean
	@Scope("prototype")
	public Encryptor encryptor() {
		// ...
	}
}
```

**Kotlin:**

```kotlin
@Configuration
class MyConfiguration {

	@Bean
	@Scope("prototype")
	fun encryptor(): Encryptor {
		// ...
	}
}
```

#### @Scope and scoped-proxy (@Scope와 scoped-proxy)

Spring은 scoped 프록시(scoped proxies)를 통해 scoped 의존성을 다루는 편리한 방법을 제공합니다. XML 설정을 사용할 때 이러한 프록시를 생성하는 가장 쉬운 방법은 `<aop:scoped-proxy/>` 요소입니다. `@Scope` 애노테이션으로 Java에서 빈을 설정하면 `proxyMode` 속성으로 동등한 지원을 제공합니다. 기본값은 `ScopedProxyMode.DEFAULT`이며, 이는 일반적으로 컴포넌트 스캔 명령 수준에서 다른 기본값이 설정되지 않은 한 scoped 프록시를 생성하지 않아야 함을 나타냅니다. `ScopedProxyMode.TARGET_CLASS`, `ScopedProxyMode.INTERFACES` 또는 `ScopedProxyMode.NO`를 지정할 수 있습니다.

XML 레퍼런스 문서(scoped proxies 참조)의 scoped 프록시 예제를 Java를 사용하는 `@Bean`으로 포팅하면 다음과 유사합니다:

**Java:**

```java
// an HTTP Session-scoped bean exposed as a proxy
@Bean
@SessionScope
public UserPreferences userPreferences() {
	return new UserPreferences();
}

@Bean
public Service userService() {
	UserService service = new SimpleUserService();
	// a reference to the proxied userPreferences bean
	service.setUserPreferences(userPreferences());
	return service;
}
```

**Kotlin:**

```kotlin
// an HTTP Session-scoped bean exposed as a proxy
@Bean
@SessionScope
fun userPreferences() = UserPreferences()

@Bean
fun userService(): Service {
	return SimpleUserService().apply {
		// a reference to the proxied userPreferences bean
		setUserPreferences(userPreferences())
	}
}
```

### Customizing Bean Naming (빈 이름 커스터마이징)

기본적으로 설정 클래스는 `@Bean` 메서드의 이름을 결과 빈의 이름으로 사용합니다. 그러나 다음 예제가 보여주는 것처럼 `name` 속성으로 이 기능을 재정의할 수 있습니다:

**Java:**

```java
@Configuration
public class AppConfig {

	@Bean("myThing")
	public Thing thing() {
		return new Thing();
	}
}
```

**Kotlin:**

```kotlin
@Configuration
class AppConfig {

	@Bean("myThing")
	fun thing() = Thing()
}
```

### Bean Aliasing (빈 별칭)

Naming Beans에서 논의한 것처럼, 단일 빈에 여러 이름을 부여하는 것이 때때로 바람직하며, 이를 빈 별칭(bean aliasing)이라고 합니다. `@Bean` 애노테이션의 `name` 속성은 이 목적을 위해 String 배열을 허용합니다. 다음 예제는 빈에 대한 여러 별칭을 설정하는 방법을 보여줍니다:

**Java:**

```java
@Configuration
public class AppConfig {

	@Bean({"dataSource", "subsystemA-dataSource", "subsystemB-dataSource"})
	public DataSource dataSource() {
		// instantiate, configure and return DataSource bean...
	}
}
```

**Kotlin:**

```kotlin
@Configuration
class AppConfig {

	@Bean("dataSource", "subsystemA-dataSource", "subsystemB-dataSource")
	fun dataSource(): DataSource {
		// instantiate, configure and return DataSource bean...
	}
}
```

### Bean Description (빈 설명)

때때로 빈에 대한 더 상세한 텍스트 설명을 제공하는 것이 유용합니다. 이는 (아마도 JMX를 통해) 모니터링 목적으로 빈이 노출될 때 특히 유용할 수 있습니다.

`@Bean`에 설명을 추가하려면, 다음 예제가 보여주는 것처럼 `@Description` 애노테이션을 사용할 수 있습니다:

**Java:**

```java
@Configuration
public class AppConfig {

	@Bean
	@Description("Provides a basic example of a bean")
	public Thing thing() {
		return new Thing();
	}
}
```

**Kotlin:**

```kotlin
@Configuration
class AppConfig {

	@Bean
	@Description("Provides a basic example of a bean")
	fun thing() = Thing()
}
```
