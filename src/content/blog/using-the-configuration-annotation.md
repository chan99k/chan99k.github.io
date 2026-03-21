---
title: "Using the @Configuration annotation"
description: "이 문서는 Spring Framework의 `@Configuration` 어노테이션을 사용하여 Java 기반 컨테이너 설정을 구성하는 방법을 설명합니다. `@Configuration`은 클래스가 Bean 정의의 소스임을 나타내는 클래스 레벨 어노테이션으로, `@Bean` 메서드를 통해 Bean을 선언하고 Bean 간 의존성을 정의할 수 있습니다. 문서는 세 가지 핵심 주제를 다룹니다: (1) `@Bean` 메서드 호출을 통한 Bean 간 의존성 주입, (2) 싱글톤과 프로토타입 스코프 Bean 간 의존성을 처리하는 Lookup Method Injection 패턴, (3) CGLIB 서브클래싱을 통해 `@Configuration` 클래스가 내부적으로 작동하는 방식. 특히 Spring은 `@Configur..."
pubDate: "2026-03-10"
tags: ["Resources/translations/Spring/IoC Container"]
contentSource: "ai-assisted"
draft: false
---

# Using the @Configuration annotation

> 원문: [Using the @Configuration annotation](https://docs.spring.io/spring-framework/reference/core/beans/java/configuration-annotation.html)

## 전문 번역

`@Configuration`은 객체가 Bean 정의의 소스임을 나타내는 클래스 레벨 어노테이션입니다. `@Configuration` 클래스는 `@Bean` 어노테이션이 붙은 메서드를 통해 Bean을 선언합니다. `@Configuration` 클래스의 `@Bean` 메서드 호출은 Bean 간 의존성을 정의하는 데에도 사용될 수 있습니다. 일반적인 소개는 [Basic Concepts: `@Bean` and `@Configuration`](basic-concepts.html)을 참조하십시오.

### Injecting Inter-bean Dependencies (Bean 간 의존성 주입)

Bean이 서로 의존성을 가질 때, 의존성을 표현하는 것은 다음 예제와 같이 하나의 Bean 메서드가 다른 Bean 메서드를 호출하는 것만큼 간단합니다:

**Java:**
```java
@Configuration
public class AppConfig {

	@Bean
	public BeanOne beanOne() {
		return new BeanOne(beanTwo());
	}

	@Bean
	public BeanTwo beanTwo() {
		return new BeanTwo();
	}
}
```

**Kotlin:**
```kotlin
@Configuration
class AppConfig {

	@Bean
	fun beanOne() = BeanOne(beanTwo())

	@Bean
	fun beanTwo() = BeanTwo()
}
```

앞의 예제에서 `beanOne`은 생성자 주입(constructor injection)을 통해 `beanTwo`에 대한 참조를 받습니다.

> **Note**
> Bean 간 의존성을 선언하는 이 방법은 `@Bean` 메서드가 `@Configuration` 클래스 내에서 선언될 때만 작동합니다. 일반 `@Component` 클래스를 사용하여 Bean 간 의존성을 선언할 수 없습니다.

### Lookup Method Injection (룩업 메서드 주입)

앞서 언급한 바와 같이, [lookup method injection](../dependencies/factory-method-injection.html)은 드물게 사용해야 하는 고급 기능입니다. 싱글톤 스코프 Bean이 프로토타입 스코프 Bean에 의존성을 가지는 경우에 유용합니다. 이러한 유형의 설정에 Java를 사용하면 이 패턴을 구현하는 자연스러운 수단을 제공합니다. 다음 예제는 lookup method injection을 사용하는 방법을 보여줍니다:

**Java:**
```java
public abstract class CommandManager {
	public Object process(Object commandState) {
		// grab a new instance of the appropriate Command interface
		Command command = createCommand();
		// set the state on the (hopefully brand new) Command instance
		command.setState(commandState);
		return command.execute();
	}

	// okay... but where is the implementation of this method?
	protected abstract Command createCommand();
}
```

**Kotlin:**
```kotlin
abstract class CommandManager {
	fun process(commandState: Any): Any {
		// grab a new instance of the appropriate Command interface
		val command = createCommand()
		// set the state on the (hopefully brand new) Command instance
		command.setState(commandState)
		return command.execute()
	}

	// okay... but where is the implementation of this method?
	protected abstract fun createCommand(): Command
}
```

Java 설정을 사용하면 추상 `createCommand()` 메서드가 새로운 (프로토타입) 커맨드 객체를 조회하는 방식으로 오버라이드되는 `CommandManager`의 서브클래스를 생성할 수 있습니다. 다음 예제는 이를 수행하는 방법을 보여줍니다:

**Java:**
```java
@Bean
@Scope("prototype")
public AsyncCommand asyncCommand() {
	AsyncCommand command = new AsyncCommand();
	// inject dependencies here as required
	return command;
}

@Bean
public CommandManager commandManager() {
	// return new anonymous implementation of CommandManager with createCommand()
	// overridden to return a new prototype Command object
	return new CommandManager() {
		protected Command createCommand() {
			return asyncCommand();
		}
	}
}
```

**Kotlin:**
```kotlin
@Bean
@Scope("prototype")
fun asyncCommand(): AsyncCommand {
	val command = AsyncCommand()
	// inject dependencies here as required
	return command
}

@Bean
fun commandManager(): CommandManager {
	// return new anonymous implementation of CommandManager with createCommand()
	// overridden to return a new prototype Command object
	return object : CommandManager() {
		override fun createCommand(): Command {
			return asyncCommand()
		}
	}
}
```

### Further Information About How Java-based Configuration Works Internally (Java 기반 설정이 내부적으로 작동하는 방식에 대한 추가 정보)

다음 예제를 고려해보십시오. 이 예제는 `@Bean` 어노테이션이 붙은 메서드가 두 번 호출되는 것을 보여줍니다:

**Java:**
```java
@Configuration
public class AppConfig {

	@Bean
	public ClientService clientService1() {
		ClientServiceImpl clientService = new ClientServiceImpl();
		clientService.setClientDao(clientDao());
		return clientService;
	}

	@Bean
	public ClientService clientService2() {
		ClientServiceImpl clientService = new ClientServiceImpl();
		clientService.setClientDao(clientDao());
		return clientService;
	}

	@Bean
	public ClientDao clientDao() {
		return new ClientDaoImpl();
	}
}
```

**Kotlin:**
```kotlin
@Configuration
class AppConfig {

	@Bean
	fun clientService1(): ClientService {
		return ClientServiceImpl().apply {
			clientDao = clientDao()
		}
	}

	@Bean
	fun clientService2(): ClientService {
		return ClientServiceImpl().apply {
			clientDao = clientDao()
		}
	}

	@Bean
	fun clientDao(): ClientDao {
		return ClientDaoImpl()
	}
}
```

`clientDao()`는 `clientService1()`에서 한 번, `clientService2()`에서 한 번 호출되었습니다. 이 메서드가 `ClientDaoImpl`의 새 인스턴스를 생성하고 반환하므로, 정상적으로는 두 개의 인스턴스(각 서비스당 하나)를 갖게 될 것으로 예상할 수 있습니다. 이는 분명히 문제가 될 것입니다: Spring에서 인스턴스화된 Bean은 기본적으로 `singleton` 스코프를 갖습니다. 여기서 마법이 일어납니다: 모든 `@Configuration` 클래스는 시작 시점에 `CGLIB`로 서브클래싱됩니다. 서브클래스에서 자식 메서드는 부모 메서드를 호출하고 새 인스턴스를 생성하기 전에 먼저 컨테이너에서 캐시된 (스코프가 지정된) Bean을 확인합니다.

> **Note**
> 동작은 Bean의 스코프에 따라 달라질 수 있습니다. 여기서는 싱글톤에 대해 이야기하고 있습니다.

> **Note**
> CGLIB 클래스는 `org.springframework.cglib` 패키지 아래에 재패키징되어 `spring-core` JAR에 직접 포함되어 있기 때문에 클래스패스에 CGLIB를 추가할 필요가 없습니다.

> **Tip**
> CGLIB가 시작 시점에 동적으로 기능을 추가한다는 사실로 인해 몇 가지 제한사항이 있습니다. 특히 설정 클래스는 final이어서는 안 됩니다. 그러나 기본 주입을 위한 `@Autowired` 사용이나 단일 비기본 생성자 선언을 포함하여 설정 클래스에서는 모든 생성자가 허용됩니다.
>
> CGLIB가 부과하는 제한사항을 피하려면 `@Configuration`이 아닌 클래스(예: 일반 `@Component` 클래스)에 `@Bean` 메서드를 선언하거나 설정 클래스에 `@Configuration(proxyBeanMethods = false)`로 어노테이션을 붙이는 것을 고려하십시오. `@Bean` 메서드 간의 교차 메서드 호출은 이 경우 인터셉트되지 않으므로 생성자 또는 메서드 레벨에서 의존성 주입에만 전적으로 의존해야 합니다.
