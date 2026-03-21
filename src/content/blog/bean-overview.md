---
title: "Bean Overview"
description: "이 문서는 Spring Framework의 IoC 컨테이너에서 관리하는 빈(bean)의 정의, 명명, 인스턴스화에 대한 포괄적인 설명을 제공합니다. 빈 정의는 `BeanDefinition` 객체로 표현되며, 클래스 이름, 스코프, 생성자 인자, 프로퍼티, 초기화/소멸 메서드 등의 메타데이터를 포함합니다. 빈의 인스턴스화는 생성자, 정적 팩토리 메서드, 인스턴스 팩토리 메서드를 통해 이루어질 수 있으며, 빈 재정의(bean overriding) 기능은 향후 버전에서 deprecated될 예정입니다."
pubDate: "2026-03-10"
tags: ["Resources/translations/Spring/IoC Container"]
contentSource: "ai-assisted"
draft: false
---

# Bean Overview

> 원문: [Bean Overview](https://docs.spring.io/spring-framework/reference/core/beans/definition.html)

## 전문 번역

### Bean Overview (빈 개요)

Spring IoC 컨테이너는 하나 이상의 빈(bean)을 관리합니다. 이러한 빈들은 컨테이너에 제공하는 설정 메타데이터(configuration metadata)를 통해 생성됩니다(예: XML `<bean/>` 정의 형태).

컨테이너 내부에서 이러한 빈 정의는 `BeanDefinition` 객체로 표현되며, (다른 정보들과 함께) 다음과 같은 메타데이터를 포함합니다:

- 패키지로 한정된 클래스 이름(package-qualified class name): 일반적으로 정의되는 빈의 실제 구현 클래스입니다.
- 빈 행동 설정 요소들(Bean behavioral configuration elements): 빈이 컨테이너에서 어떻게 동작해야 하는지를 지정합니다(스코프(scope), 생명주기 콜백(lifecycle callbacks) 등).
- 빈이 작업을 수행하는 데 필요한 다른 빈들에 대한 참조(References). 이러한 참조를 협력자(collaborators) 또는 의존성(dependencies)이라고도 합니다.
- 새로 생성된 객체에 설정할 기타 설정값들 — 예를 들어, 커넥션 풀을 관리하는 빈에서 사용할 풀의 크기 제한이나 커넥션 수 등입니다.

이 메타데이터는 각 빈 정의를 구성하는 일련의 프로퍼티로 변환됩니다. 다음 표는 이러한 프로퍼티들을 설명합니다:

**표 1. 빈 정의 (The bean definition)**

| 프로퍼티 (Property) | 설명 위치 (Explained in…​) |
|---------------------|---------------------------|
| Class | [빈 인스턴스화하기(Instantiating Beans)](#beans-factory-class) |
| Name | [빈 명명하기(Naming Beans)](#beans-beanname) |
| Scope | [빈 스코프(Bean Scopes)](factory-scopes.html) |
| Constructor arguments | [의존성 주입(Dependency Injection)](dependencies/factory-collaborators.html) |
| Properties | [의존성 주입(Dependency Injection)](dependencies/factory-collaborators.html) |
| Autowiring mode | [협력자 자동와이어링(Autowiring Collaborators)](dependencies/factory-autowire.html) |
| Lazy initialization mode | [지연 초기화 빈(Lazy-initialized Beans)](dependencies/factory-lazy-init.html) |
| Initialization method | [초기화 콜백(Initialization Callbacks)](factory-nature.html#beans-factory-lifecycle-initializingbean) |
| Destruction method | [소멸 콜백(Destruction Callbacks)](factory-nature.html#beans-factory-lifecycle-disposablebean) |

특정 빈을 생성하는 방법에 대한 정보를 포함하는 빈 정의 외에도, `ApplicationContext` 구현체들은 (사용자에 의해) 컨테이너 외부에서 생성된 기존 객체의 등록도 허용합니다. 이는 `getAutowireCapableBeanFactory()` 메서드를 통해 ApplicationContext의 `BeanFactory`에 접근함으로써 수행되며, 이 메서드는 `DefaultListableBeanFactory` 구현체를 반환합니다. `DefaultListableBeanFactory`는 `registerSingleton(..)` 및 `registerBeanDefinition(..)` 메서드를 통해 이러한 등록을 지원합니다. 그러나 일반적인 애플리케이션은 정규 빈 정의 메타데이터를 통해 정의된 빈들로만 작동합니다.

> **참고 (Note)**
>
> 빈 메타데이터와 수동으로 제공된 싱글톤 인스턴스는 컨테이너가 자동와이어링 및 기타 내부 검사(introspection) 단계에서 이들에 대해 적절히 추론할 수 있도록 가능한 한 빨리 등록되어야 합니다. 기존 메타데이터와 기존 싱글톤 인스턴스의 재정의는 어느 정도 지원되지만, 런타임에 새로운 빈을 등록하는 것(팩토리에 대한 실시간 접근과 동시에)은 공식적으로 지원되지 않으며 동시 접근 예외, 빈 컨테이너의 불일치 상태, 또는 이 둘 모두를 초래할 수 있습니다.


### Overriding Beans (빈 재정의)

빈 재정의(Bean overriding)는 이미 할당된 식별자(identifier)를 사용하여 빈이 등록될 때 발생합니다. 빈 재정의가 가능하기는 하지만, 설정을 읽기 어렵게 만듭니다.

> **경고 (Warning)**
>
> 빈 재정의는 향후 릴리스에서 deprecated될 예정입니다.

빈 재정의를 완전히 비활성화하려면, `ApplicationContext`가 refresh되기 전에 `allowBeanDefinitionOverriding` 플래그를 `false`로 설정할 수 있습니다. 이러한 설정에서는 빈 재정의가 사용되면 예외가 발생합니다.

기본적으로 컨테이너는 빈 재정의 시도를 모두 `INFO` 레벨에서 로깅하므로, 그에 따라 설정을 조정할 수 있습니다. 권장되지는 않지만, `allowBeanDefinitionOverriding` 플래그를 `true`로 설정하여 이러한 로그를 억제할 수 있습니다.

#### Java Configuration (Java 설정)

Java Configuration을 사용하는 경우, 해당 `@Bean` 메서드는 `@Bean` 메서드의 반환 타입이 해당 빈 클래스와 일치하는 한, 동일한 컴포넌트 이름을 가진 스캔된 빈 클래스를 항상 자동으로 재정의합니다. 이는 단순히 컨테이너가 빈 클래스의 미리 선언된 생성자보다 `@Bean` 팩토리 메서드를 호출한다는 것을 의미합니다.

> **참고 (Note)**
>
> 테스트 시나리오에서 빈을 재정의하는 것이 편리하다는 점을 인정하며, 이에 대한 명시적인 지원이 있습니다. 자세한 내용은 [이 섹션](../../testing/testcontext-framework/bean-overriding.html)을 참조하세요.


### Naming Beans (빈 명명하기)

모든 빈은 하나 이상의 식별자를 가집니다. 이러한 식별자는 빈을 호스팅하는 컨테이너 내에서 고유해야 합니다. 빈은 일반적으로 하나의 식별자만 가집니다. 그러나 둘 이상이 필요한 경우, 추가 식별자들은 별칭(alias)으로 간주될 수 있습니다.

XML 기반 설정 메타데이터에서는 `id` 속성, `name` 속성 또는 둘 다를 사용하여 빈 식별자를 지정합니다. `id` 속성을 사용하면 정확히 하나의 `id`를 지정할 수 있습니다. 관례적으로 이러한 이름은 영숫자('myBean', 'someService' 등)이지만, 특수 문자도 포함할 수 있습니다. 빈에 다른 별칭을 도입하려는 경우, `name` 속성에서 쉼표(`,`), 세미콜론(`;`) 또는 공백으로 구분하여 지정할 수도 있습니다. `id` 속성은 `xsd:string` 타입으로 정의되어 있지만, 빈 `id` 고유성은 XML 파서가 아니라 컨테이너에 의해 강제됩니다.

빈에 대해 `name` 또는 `id`를 제공할 필요는 없습니다. `name` 또는 `id`를 명시적으로 제공하지 않으면, 컨테이너는 해당 빈에 대해 고유한 이름을 생성합니다. 그러나 `ref` 요소나 Service Locator 스타일 조회를 통해 이름으로 해당 빈을 참조하려면, 이름을 제공해야 합니다. 이름을 제공하지 않는 동기는 [내부 빈(inner beans)](dependencies/factory-properties-detailed.html#beans-inner-beans) 사용 및 [협력자 자동와이어링(autowiring collaborators)](dependencies/factory-autowire.html)과 관련이 있습니다.

#### Bean Naming Conventions (빈 명명 규칙)

빈 이름을 지정할 때는 인스턴스 필드 이름에 대한 표준 Java 관례를 사용하는 것이 규칙입니다. 즉, 빈 이름은 소문자로 시작하고 그 이후부터는 camel-case를 사용합니다. 이러한 이름의 예로는 `accountManager`, `accountService`, `userDao`, `loginController` 등이 있습니다.

빈 이름을 일관되게 지정하면 설정을 더 쉽게 읽고 이해할 수 있습니다. 또한 Spring AOP를 사용하는 경우, 이름으로 관련된 빈 세트에 어드바이스를 적용할 때 많은 도움이 됩니다.

> **참고 (Note)**
>
> 클래스패스에서 컴포넌트 스캐닝을 사용하면, Spring은 이전에 설명한 규칙에 따라 이름 없는 컴포넌트에 대한 빈 이름을 생성합니다: 기본적으로 단순 클래스 이름을 가져와서 첫 글자를 소문자로 변환합니다. 그러나 (특이한) 특수한 경우로 두 개 이상의 문자가 있고 첫 번째와 두 번째 문자가 모두 대문자인 경우, 원래의 대소문자 구분이 보존됩니다. 이는 `java.beans.Introspector.decapitalize`에 의해 정의된 것과 동일한 규칙입니다(Spring이 여기서 사용하는 방식).

#### Aliasing a Bean outside the Bean Definition (빈 정의 외부에서 빈에 별칭 부여하기)

빈 정의 자체에서 `id` 속성으로 지정된 최대 하나의 이름과 `name` 속성의 다른 이름들을 조합하여 빈에 대해 둘 이상의 이름을 제공할 수 있습니다. 이러한 이름들은 동일한 빈에 대한 동등한 별칭이 될 수 있으며, 애플리케이션의 각 컴포넌트가 해당 컴포넌트 자체에 특정한 빈 이름을 사용하여 공통 의존성을 참조하도록 하는 등의 상황에서 유용합니다.

그러나 빈이 실제로 정의된 곳에서 모든 별칭을 지정하는 것이 항상 적절한 것은 아닙니다. 다른 곳에서 정의된 빈에 대한 별칭을 도입하는 것이 바람직할 때가 있습니다. 이는 설정이 각 하위 시스템에 분산되어 있고, 각 하위 시스템이 자체 객체 정의 세트를 가지고 있는 대규모 시스템에서 일반적입니다. XML 기반 설정 메타데이터에서는 `<alias/>` 요소를 사용하여 이를 수행할 수 있습니다. 다음 예제는 그 방법을 보여줍니다:

```xml
<alias name="fromName" alias="toName"/>
```

이 경우, (같은 컨테이너에서) `fromName`이라는 이름의 빈은 이 별칭 정의를 사용한 후에 `toName`으로도 참조될 수 있습니다.

예를 들어, 하위 시스템 A의 설정 메타데이터는 `subsystemA-dataSource`라는 이름으로 DataSource를 참조할 수 있습니다. 하위 시스템 B의 설정 메타데이터는 `subsystemB-dataSource`라는 이름으로 DataSource를 참조할 수 있습니다. 이 두 하위 시스템을 모두 사용하는 주 애플리케이션을 구성할 때, 주 애플리케이션은 `myApp-dataSource`라는 이름으로 DataSource를 참조합니다. 세 개의 이름이 모두 같은 객체를 참조하도록 하려면, 설정 메타데이터에 다음과 같은 별칭 정의를 추가할 수 있습니다:

```xml
<alias name="myApp-dataSource" alias="subsystemA-dataSource"/>
<alias name="myApp-dataSource" alias="subsystemB-dataSource"/>
```

이제 각 컴포넌트와 주 애플리케이션은 고유하고 다른 정의와 충돌하지 않는 것이 보장된 이름을 통해 dataSource를 참조할 수 있지만(효과적으로 네임스페이스를 생성), 동일한 빈을 참조합니다.

#### Java-configuration (Java 설정)

Java Configuration을 사용하는 경우, `@Bean` 어노테이션을 사용하여 별칭을 제공할 수 있습니다. 자세한 내용은 [`@Bean` 어노테이션 사용하기(Using the `@Bean` Annotation)](java/bean-annotation.html)를 참조하세요.


### Instantiating Beans (빈 인스턴스화하기)

빈 정의는 본질적으로 하나 이상의 객체를 생성하기 위한 레시피(recipe)입니다. 컨테이너는 요청을 받으면 명명된 빈에 대한 레시피를 살펴보고, 해당 빈 정의에 캡슐화된 설정 메타데이터를 사용하여 실제 객체를 생성(또는 획득)합니다.

XML 기반 설정 메타데이터를 사용하는 경우, `<bean/>` 요소의 `class` 속성에서 인스턴스화될 객체의 타입(또는 클래스)을 지정합니다. 이 `class` 속성(내부적으로는 `BeanDefinition` 인스턴스의 `Class` 프로퍼티)은 일반적으로 필수입니다. (예외 사항은 [인스턴스 팩토리 메서드를 사용한 인스턴스화(Instantiation by Using an Instance Factory Method)](#beans-factory-class-instance-factory-method) 및 [빈 정의 상속(Bean Definition Inheritance)](child-bean-definitions.html)을 참조하세요.) `Class` 프로퍼티는 다음 두 가지 방법 중 하나로 사용할 수 있습니다:

- 일반적으로, 컨테이너 자체가 생성자를 리플렉티브하게 호출하여 빈을 직접 생성하는 경우에 구성될 빈 클래스를 지정합니다. 이는 Java 코드에서 `new` 연산자를 사용하는 것과 다소 동등합니다.
- 덜 일반적인 경우로, 컨테이너가 클래스의 `static` 팩토리 메서드를 호출하여 빈을 생성할 때, 객체를 생성하기 위해 호출되는 `static` 팩토리 메서드를 포함하는 실제 클래스를 지정합니다. `static` 팩토리 메서드 호출로부터 반환되는 객체 타입은 동일한 클래스이거나 완전히 다른 클래스일 수 있습니다.

#### Nested class names (중첩 클래스 이름)

중첩 클래스(nested class)에 대한 빈 정의를 설정하려는 경우, 중첩 클래스의 바이너리 이름(binary name) 또는 소스 이름(source name)을 사용할 수 있습니다.

예를 들어, `com.example` 패키지에 `SomeThing`이라는 클래스가 있고, 이 `SomeThing` 클래스에 `OtherThing`이라는 `static` 중첩 클래스가 있다면, 달러 기호(`$`) 또는 점(`.`)으로 구분할 수 있습니다. 따라서 빈 정의의 `class` 속성 값은 `com.example.SomeThing$OtherThing` 또는 `com.example.SomeThing.OtherThing`이 됩니다.

#### Instantiation with a Constructor (생성자를 사용한 인스턴스화)

생성자 접근 방식으로 빈을 생성하면, 모든 일반 클래스가 Spring에서 사용 가능하고 호환됩니다. 즉, 개발 중인 클래스가 특정 인터페이스를 구현하거나 특정 방식으로 코딩될 필요가 없습니다. 단순히 빈 클래스를 지정하는 것으로 충분합니다. 그러나 해당 특정 빈에 대해 사용하는 IoC 타입에 따라, 기본(빈) 생성자가 필요할 수 있습니다.

Spring IoC 컨테이너는 관리하고자 하는 거의 모든 클래스를 관리할 수 있습니다. 진정한 JavaBeans만 관리하도록 제한되지 않습니다. 대부분의 Spring 사용자는 기본(인자 없는) 생성자와 컨테이너의 프로퍼티를 모델로 한 적절한 setter 및 getter만 있는 실제 JavaBeans를 선호합니다. 컨테이너에 더 이국적인 non-bean-style 클래스를 가질 수도 있습니다. 예를 들어, JavaBean 사양을 전혀 준수하지 않는 레거시 커넥션 풀을 사용해야 하는 경우에도 Spring이 관리할 수 있습니다.

XML 기반 설정 메타데이터를 사용하면 다음과 같이 빈 클래스를 지정할 수 있습니다:

```xml
<bean id="exampleBean" class="examples.ExampleBean"/>

<bean name="anotherExample" class="examples.ExampleBeanTwo"/>
```

생성자에 인자를 제공하는 메커니즘(필요한 경우) 및 객체가 생성된 후 객체 인스턴스 프로퍼티를 설정하는 것에 대한 자세한 내용은 [의존성 주입하기(Injecting Dependencies)](dependencies/factory-collaborators.html)를 참조하세요.

> **참고 (Note)**
>
> 생성자 인자의 경우, 컨테이너는 여러 개의 오버로드된 생성자 중에서 해당하는 생성자를 선택할 수 있습니다. 그렇긴 하지만 모호함을 피하기 위해서는 생성자 시그니처를 가능한 한 간단하게 유지하는 것이 권장됩니다.

#### Instantiation with a Static Factory Method (정적 팩토리 메서드를 사용한 인스턴스화)

정적 팩토리 메서드로 생성하는 빈을 정의할 때는, `class` 속성을 사용하여 `static` 팩토리 메서드를 포함하는 클래스를 지정하고, `factory-method`라는 이름의 속성을 사용하여 팩토리 메서드 자체의 이름을 지정합니다. 이 메서드를 호출하고(나중에 설명할 선택적 인자 사용) 활성 객체를 반환할 수 있어야 하며, 이후 해당 객체는 생성자를 통해 생성된 것처럼 처리됩니다. 이러한 빈 정의의 한 가지 용도는 레거시 코드에서 `static` 팩토리를 호출하는 것입니다.

다음 빈 정의는 팩토리 메서드를 호출하여 빈이 생성될 것임을 지정합니다. 정의에서는 반환되는 객체의 타입(클래스)을 지정하지 않고, 팩토리 메서드를 포함하는 클래스를 지정합니다. 이 예제에서 `createInstance()` 메서드는 `static` 메서드여야 합니다. 다음 예제는 팩토리 메서드를 지정하는 방법을 보여줍니다:

```xml
<bean id="clientService"
	class="examples.ClientService"
	factory-method="createInstance"/>
```

다음 예제는 앞의 빈 정의와 함께 작동할 수 있는 클래스를 보여줍니다:

**Java:**
```java
public class ClientService {
	private static ClientService clientService = new ClientService();
	private ClientService() {}

	public static ClientService createInstance() {
		return clientService;
	}
}
```

**Kotlin:**
```kotlin
class ClientService private constructor() {
	companion object {
		private val clientService = ClientService()
		@JvmStatic
		fun createInstance() = clientService
	}
}
```

팩토리 메서드에 (선택적) 인자를 제공하고 팩토리에서 객체가 반환된 후 객체 인스턴스 프로퍼티를 설정하는 메커니즘에 대한 자세한 내용은 [의존성 및 설정 상세(Dependencies and Configuration in Detail)](dependencies/factory-properties-detailed.html)를 참조하세요.

> **참고 (Note)**
>
> 팩토리 메서드 인자의 경우, 컨테이너는 같은 이름의 여러 개의 오버로드된 메서드 중에서 해당하는 메서드를 선택할 수 있습니다. 그렇긴 하지만 모호함을 피하기 위해서는 팩토리 메서드 시그니처를 가능한 한 간단하게 유지하는 것이 권장됩니다.

> **팁 (Tip)**
>
> 팩토리 메서드 오버로딩의 전형적인 문제 사례는 `mock` 메서드의 많은 오버로드를 가진 Mockito입니다. 가능한 한 가장 구체적인 `mock` 변형을 선택하세요:
>
> ```xml
> <bean id="clientService" class="org.mockito.Mockito" factory-method="mock">
> 	<constructor-arg type="java.lang.Class" value="examples.ClientService"/>
> 	<constructor-arg type="java.lang.String" value="clientService"/>
> </bean>
> ```

#### Instantiation by Using an Instance Factory Method (인스턴스 팩토리 메서드를 사용한 인스턴스화)

[정적 팩토리 메서드를 통한 인스턴스화(instantiation through a static factory method)](#beans-factory-class-static-factory-method)와 유사하게, 인스턴스 팩토리 메서드를 사용한 인스턴스화는 컨테이너의 기존 빈에서 non-static 메서드를 호출하여 새 빈을 생성합니다. 이 메커니즘을 사용하려면, `class` 속성을 비워두고, `factory-bean` 속성에서 객체를 생성하기 위해 호출될 인스턴스 메서드를 포함하는 현재(또는 부모 또는 조상) 컨테이너의 빈 이름을 지정합니다. 팩토리 메서드 자체의 이름은 `factory-method` 속성으로 설정합니다. 다음 예제는 이러한 빈을 설정하는 방법을 보여줍니다:

```xml
<!-- the factory bean, which contains a method called createClientServiceInstance() -->
<bean id="serviceLocator" class="examples.DefaultServiceLocator">
	<!-- inject any dependencies required by this locator bean -->
</bean>

<!-- the bean to be created via the factory bean -->
<bean id="clientService"
	factory-bean="serviceLocator"
	factory-method="createClientServiceInstance"/>
```

다음 예제는 해당 클래스를 보여줍니다:

**Java:**
```java
public class DefaultServiceLocator {

	private static ClientService clientService = new ClientServiceImpl();

	public ClientService createClientServiceInstance() {
		return clientService;
	}
}
```

**Kotlin:**
```kotlin
class DefaultServiceLocator {
	companion object {
		private val clientService = ClientServiceImpl()
	}
	fun createClientServiceInstance(): ClientService {
		return clientService
	}
}
```

하나의 팩토리 클래스는 둘 이상의 팩토리 메서드를 보유할 수도 있습니다. 다음 예제가 이를 보여줍니다:

```xml
<bean id="serviceLocator" class="examples.DefaultServiceLocator">
	<!-- inject any dependencies required by this locator bean -->
</bean>

<bean id="clientService"
	factory-bean="serviceLocator"
	factory-method="createClientServiceInstance"/>

<bean id="accountService"
	factory-bean="serviceLocator"
	factory-method="createAccountServiceInstance"/>
```

다음 예제는 해당 클래스를 보여줍니다:

**Java:**
```java
public class DefaultServiceLocator {

	private static ClientService clientService = new ClientServiceImpl();

	private static AccountService accountService = new AccountServiceImpl();

	public ClientService createClientServiceInstance() {
		return clientService;
	}

	public AccountService createAccountServiceInstance() {
		return accountService;
	}
}
```

**Kotlin:**
```kotlin
class DefaultServiceLocator {
	companion object {
		private val clientService = ClientServiceImpl()
		private val accountService = AccountServiceImpl()
	}

	fun createClientServiceInstance(): ClientService {
		return clientService
	}

	fun createAccountServiceInstance(): AccountService {
		return accountService
	}
}
```

이 접근 방식은 팩토리 빈 자체가 의존성 주입(DI)을 통해 관리되고 설정될 수 있음을 보여줍니다. [의존성 및 설정 상세(Dependencies and Configuration in Detail)](dependencies/factory-properties-detailed.html)를 참조하세요.

> **참고 (Note)**
>
> Spring 문서에서 "factory bean"은 Spring 컨테이너에 설정되고 [인스턴스(instance)](#beans-factory-class-instance-factory-method) 또는 [정적(static)](#beans-factory-class-static-factory-method) 팩토리 메서드를 통해 객체를 생성하는 빈을 의미합니다. 반면에 `FactoryBean`(대문자 표기에 주목)은 Spring 특화 [`FactoryBean`](factory-extension.html#beans-factory-extension-factorybean) 구현 클래스를 의미합니다.

#### Determining a Bean's Runtime Type (빈의 런타임 타입 결정하기)

특정 빈의 런타임 타입을 결정하는 것은 간단하지 않습니다. 빈 메타데이터 정의에서 지정된 클래스는 단지 초기 클래스 참조일 뿐이며, 선언된 팩토리 메서드와 결합되거나 빈의 다른 런타임 타입으로 이어질 수 있는 `FactoryBean` 클래스이거나, 인스턴스 수준 팩토리 메서드의 경우(지정된 `factory-bean` 이름을 통해 해결되는) 전혀 설정되지 않을 수 있습니다. 또한 AOP 프록시는 대상 빈의 실제 타입(구현된 인터페이스만)에 대한 제한적인 노출로 인터페이스 기반 프록시로 빈 인스턴스를 래핑할 수 있습니다.

특정 빈의 실제 런타임 타입을 알아내기 위해 권장되는 방법은 지정된 빈 이름에 대해 `BeanFactory.getType` 호출을 하는 것입니다. 이는 위의 모든 경우를 고려하고 `BeanFactory.getBean` 호출이 같은 빈 이름에 대해 반환할 객체의 타입을 반환합니다.
