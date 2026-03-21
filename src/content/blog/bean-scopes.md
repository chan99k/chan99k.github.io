---
title: "Bean Scopes"
description: "Spring Framework는 빈(Bean)의 생명주기와 인스턴스 생성 방식을 제어하는 6가지 스코프(Scope)를 제공합니다. singleton(기본값)과 prototype은 모든 컨테이너에서 사용 가능하며, request, session, application, websocket은 웹 기반 ApplicationContext에서만 사용할 수 있습니다. singleton은 컨테이너당 하나의 인스턴스를 유지하고, prototype은 요청할 때마다 새 인스턴스를 생성합니다."
pubDate: "2026-03-10"
tags: ["Resources/translations/Spring/IoC Container"]
contentSource: "ai-assisted"
draft: false
---

# Bean Scopes

> 원문: [Bean Scopes](https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html)

## 전문 번역

### Bean Scopes (빈 스코프)

빈 정의(bean definition)를 생성할 때, 여러분은 해당 빈 정의에 의해 정의된 클래스의 실제 인스턴스를 생성하기 위한 레시피(recipe)를 만드는 것입니다. 빈 정의가 레시피라는 개념은 중요한데, 이는 클래스와 마찬가지로 단일 레시피로부터 많은 객체 인스턴스를 생성할 수 있다는 것을 의미하기 때문입니다.

특정 빈 정의로부터 생성되는 객체에 주입될 다양한 의존성(dependencies)과 구성 값(configuration values)을 제어할 수 있을 뿐만 아니라, 특정 빈 정의로부터 생성되는 객체의 스코프(scope)도 제어할 수 있습니다. 이러한 접근 방식은 강력하고 유연한데, 왜냐하면 Java 클래스 레벨에서 객체의 스코프를 하드코딩하지 않고 구성(configuration)을 통해 생성할 객체의 스코프를 선택할 수 있기 때문입니다. 빈은 여러 스코프 중 하나에 배포되도록 정의될 수 있습니다. Spring Framework는 6가지 스코프를 지원하며, 그 중 4가지는 웹 인식(web-aware) ApplicationContext를 사용할 때만 사용할 수 있습니다. 커스텀 스코프(custom scope)를 생성할 수도 있습니다.

다음 표는 지원되는 스코프를 설명합니다:

**표 1. 빈 스코프**

| Scope | Description |
|-------|-------------|
| singleton | (기본값) 각 Spring IoC 컨테이너에 대해 단일 빈 정의를 단일 객체 인스턴스로 스코핑합니다. |
| prototype | 단일 빈 정의를 임의의 수의 객체 인스턴스로 스코핑합니다. |
| request | 단일 빈 정의를 단일 HTTP 요청의 생명주기로 스코핑합니다. 즉, 각 HTTP 요청은 단일 빈 정의의 뒤편에서 생성된 자체 빈 인스턴스를 갖습니다. 웹 인식 Spring ApplicationContext의 컨텍스트에서만 유효합니다. |
| session | 단일 빈 정의를 HTTP Session의 생명주기로 스코핑합니다. 웹 인식 Spring ApplicationContext의 컨텍스트에서만 유효합니다. |
| application | 단일 빈 정의를 ServletContext의 생명주기로 스코핑합니다. 웹 인식 Spring ApplicationContext의 컨텍스트에서만 유효합니다. |
| websocket | 단일 빈 정의를 WebSocket의 생명주기로 스코핑합니다. 웹 인식 Spring ApplicationContext의 컨텍스트에서만 유효합니다. |

> **참고**: thread 스코프를 사용할 수 있지만 기본적으로 등록되지 않습니다. 자세한 내용은 SimpleThreadScope 문서를 참조하세요. 이 스코프나 다른 커스텀 스코프를 등록하는 방법에 대한 지침은 "커스텀 스코프 사용하기"를 참조하세요.

### The Singleton Scope (싱글톤 스코프)

싱글톤 빈의 공유 인스턴스는 단 하나만 관리되며, 해당 빈 정의와 일치하는 ID 또는 ID들을 가진 빈에 대한 모든 요청은 Spring 컨테이너에 의해 그 하나의 특정 빈 인스턴스가 반환됩니다.

다시 말해, 빈 정의를 정의하고 그것이 싱글톤으로 스코핑되면, Spring IoC 컨테이너는 해당 빈 정의에 의해 정의된 객체의 정확히 하나의 인스턴스를 생성합니다. 이 단일 인스턴스는 그러한 싱글톤 빈들의 캐시에 저장되며, 해당 명명된 빈에 대한 모든 후속 요청과 참조는 캐시된 객체를 반환합니다. 다음 이미지는 싱글톤 스코프가 어떻게 작동하는지 보여줍니다:

![singleton](/04-Archive/ATTACHMENTS/singleton.png)

Spring의 싱글톤 빈 개념은 Gang of Four (GoF) 패턴 책에 정의된 싱글톤 패턴과 다릅니다. GoF 싱글톤은 객체의 스코프를 하드코딩하여 ClassLoader당 특정 클래스의 인스턴스가 하나만 생성되도록 합니다. Spring 싱글톤의 스코프는 컨테이너당 그리고 빈당(per-container and per-bean)으로 가장 잘 설명됩니다. 이는 단일 Spring 컨테이너에서 특정 클래스에 대해 하나의 빈을 정의하면, Spring 컨테이너가 해당 빈 정의에 의해 정의된 클래스의 하나의 그리고 단 하나의 인스턴스를 생성한다는 것을 의미합니다. 싱글톤 스코프는 Spring의 기본 스코프입니다. XML에서 빈을 싱글톤으로 정의하려면, 다음 예제와 같이 빈을 정의할 수 있습니다:

```xml
<bean id="accountService" class="com.something.DefaultAccountService"/>

<!-- the following is equivalent, though redundant (singleton scope is the default) -->
<bean id="accountService" class="com.something.DefaultAccountService" scope="singleton"/>
```

### The Prototype Scope (프로토타입 스코프)

빈 배포의 비싱글톤 프로토타입 스코프는 특정 빈에 대한 요청이 있을 때마다 새 빈 인스턴스의 생성을 초래합니다. 즉, 빈이 다른 빈에 주입되거나 컨테이너의 `getBean()` 메서드 호출을 통해 요청됩니다. 일반적으로, 모든 상태 저장(stateful) 빈에는 프로토타입 스코프를 사용하고 상태 비저장(stateless) 빈에는 싱글톤 스코프를 사용해야 합니다.

다음 다이어그램은 Spring 프로토타입 스코프를 보여줍니다:

![prototype](/04-Archive/ATTACHMENTS/prototype.png)

> (데이터 액세스 객체(DAO)는 일반적으로 프로토타입으로 구성되지 않습니다. 왜냐하면 일반적인 DAO는 어떤 대화 상태(conversational state)도 보유하지 않기 때문입니다. 우리가 싱글톤 다이어그램의 핵심을 재사용하는 것이 더 쉬웠습니다.)

다음 예제는 XML에서 빈을 프로토타입으로 정의합니다:

```xml
<bean id="accountService" class="com.something.DefaultAccountService" scope="prototype"/>
```

다른 스코프와 대조적으로, Spring은 프로토타입 빈의 완전한 생명주기를 관리하지 않습니다. 컨테이너는 프로토타입 객체를 인스턴스화하고, 구성하고, 그 외의 조립을 하고 클라이언트에 전달하며, 그 프로토타입 인스턴스에 대한 추가 기록을 남기지 않습니다. 따라서 초기화 생명주기 콜백 메서드(initialization lifecycle callback methods)는 스코프에 관계없이 모든 객체에서 호출되지만, 프로토타입의 경우 구성된 소멸 생명주기 콜백(destruction lifecycle callbacks)은 호출되지 않습니다. 클라이언트 코드는 프로토타입 스코프 객체를 정리하고 프로토타입 빈이 보유한 비용이 많이 드는 리소스를 해제해야 합니다. 프로토타입 스코프 빈이 보유한 리소스를 Spring 컨테이너가 해제하도록 하려면, 정리가 필요한 빈에 대한 참조를 보유한 커스텀 빈 후처리기(custom bean post-processor)를 사용해 보세요.

어떤 측면에서, 프로토타입 스코프 빈과 관련하여 Spring 컨테이너의 역할은 Java `new` 연산자를 대체하는 것입니다. 그 시점 이후의 모든 생명주기 관리는 클라이언트가 처리해야 합니다. (Spring 컨테이너에서 빈의 생명주기에 대한 자세한 내용은 "생명주기 콜백(Lifecycle Callbacks)"을 참조하세요.)

### Singleton Beans with Prototype-bean Dependencies (프로토타입 빈 의존성을 가진 싱글톤 빈)

프로토타입 빈에 대한 의존성을 가진 싱글톤 스코프 빈을 사용할 때, 의존성은 인스턴스화 시점에 해결된다는 점을 유의하세요. 따라서 프로토타입 스코프 빈을 싱글톤 스코프 빈에 의존성 주입하면, 새 프로토타입 빈이 인스턴스화되고 나서 싱글톤 빈에 의존성 주입됩니다. 프로토타입 인스턴스는 싱글톤 스코프 빈에 제공되는 유일한 인스턴스입니다.

그러나 싱글톤 스코프 빈이 런타임에 반복적으로 프로토타입 스코프 빈의 새 인스턴스를 획득하기를 원한다고 가정해 봅시다. 프로토타입 스코프 빈을 싱글톤 빈에 의존성 주입할 수 없습니다. 왜냐하면 그 주입은 Spring 컨테이너가 싱글톤 빈을 인스턴스화하고 그 의존성을 해결하고 주입할 때 단 한 번만 발생하기 때문입니다. 런타임에 프로토타입 빈의 새 인스턴스가 한 번 이상 필요하다면, "메서드 주입(Method Injection)"을 참조하세요.

### Request, Session, Application, and WebSocket Scopes (요청, 세션, 애플리케이션, 웹소켓 스코프)

`request`, `session`, `application`, `websocket` 스코프는 웹 인식 Spring ApplicationContext 구현(예: `XmlWebApplicationContext`)을 사용할 때만 사용할 수 있습니다. 이러한 스코프를 `ClassPathXmlApplicationContext`와 같은 일반 Spring IoC 컨테이너와 함께 사용하면, 알려지지 않은 빈 스코프에 대해 불평하는 `IllegalStateException`이 발생합니다.

#### Initial Web Configuration (초기 웹 구성)

`request`, `session`, `application`, `websocket` 레벨(웹 스코프 빈)에서 빈의 스코핑을 지원하려면, 빈을 정의하기 전에 약간의 초기 구성이 필요합니다. (이 초기 설정은 표준 스코프인 `singleton`과 `prototype`에는 필요하지 않습니다.)

이 초기 설정을 수행하는 방법은 특정 Servlet 환경에 따라 다릅니다.

Spring Web MVC 내에서 스코프 빈에 액세스하는 경우, 실제로 Spring `DispatcherServlet`에 의해 처리되는 요청 내에서는 특별한 설정이 필요하지 않습니다. `DispatcherServlet`은 이미 모든 관련 상태를 노출합니다.

Spring의 `DispatcherServlet` 외부에서 처리되는 요청과 함께 Servlet 웹 컨테이너를 사용하는 경우(예: JSF를 사용할 때), `org.springframework.web.context.request.RequestContextListener` `ServletRequestListener`를 등록해야 합니다. 이는 `WebApplicationInitializer` 인터페이스를 사용하여 프로그래밍 방식으로 수행할 수 있습니다. 또는 다음 선언을 웹 애플리케이션의 `web.xml` 파일에 추가하세요:

```xml
<web-app>
	...
	<listener>
		<listener-class>
			org.springframework.web.context.request.RequestContextListener
		</listener-class>
	</listener>
	...
</web-app>
```

또는 리스너 설정에 문제가 있는 경우, Spring의 `RequestContextFilter` 사용을 고려하세요. 필터 매핑은 주변 웹 애플리케이션 구성에 따라 다르므로 적절하게 변경해야 합니다. 다음 목록은 웹 애플리케이션의 필터 부분을 보여줍니다:

```xml
<web-app>
	...
	<filter>
		<filter-name>requestContextFilter</filter-name>
		<filter-class>org.springframework.web.filter.RequestContextFilter</filter-class>
	</filter>
	<filter-mapping>
		<filter-name>requestContextFilter</filter-name>
		<url-pattern>/*</url-pattern>
	</filter-mapping>
	...
</web-app>
```

`DispatcherServlet`, `RequestContextListener`, `RequestContextFilter`는 모두 정확히 같은 일을 합니다. 즉, HTTP 요청 객체를 해당 요청을 서비스하는 `Thread`에 바인딩합니다. 이것은 요청 및 세션 스코프 빈을 호출 체인의 아래쪽에서 사용할 수 있게 만듭니다.

#### Request scope (요청 스코프)

빈 정의에 대한 다음 XML 구성을 고려하세요:

```xml
<bean id="loginAction" class="com.something.LoginAction" scope="request"/>
```

Spring 컨테이너는 각각의 모든 HTTP 요청에 대해 `loginAction` 빈 정의를 사용하여 `LoginAction` 빈의 새 인스턴스를 생성합니다. 즉, `loginAction` 빈은 HTTP 요청 레벨에서 스코핑됩니다. 동일한 `loginAction` 빈 정의로부터 생성된 다른 인스턴스는 이러한 상태 변경을 보지 못하기 때문에, 생성된 인스턴스의 내부 상태를 원하는 만큼 변경할 수 있습니다. 그것들은 개별 요청에 특정합니다. 요청이 처리를 완료하면, 요청에 스코핑된 빈은 폐기됩니다.

어노테이션 기반 컴포넌트(annotation-driven components)나 Java 구성을 사용할 때, `@RequestScope` 어노테이션을 사용하여 컴포넌트를 요청 스코프에 할당할 수 있습니다. 다음 예제는 그렇게 하는 방법을 보여줍니다:

**Java:**

```java
@RequestScope
@Component
public class LoginAction {
	// ...
}
```

**Kotlin:**

```kotlin
@RequestScope
@Component
class LoginAction {
	// ...
}
```

#### Session Scope (세션 스코프)

빈 정의에 대한 다음 XML 구성을 고려하세요:

```xml
<bean id="userPreferences" class="com.something.UserPreferences" scope="session"/>
```

Spring 컨테이너는 단일 HTTP `Session`의 수명 동안 `userPreferences` 빈 정의를 사용하여 `UserPreferences` 빈의 새 인스턴스를 생성합니다. 다시 말해, `userPreferences` 빈은 HTTP `Session` 레벨에서 효과적으로 스코핑됩니다. 요청 스코프 빈과 마찬가지로, 동일한 `userPreferences` 빈 정의로부터 생성된 인스턴스를 사용하는 다른 HTTP `Session` 인스턴스는 이러한 상태 변경을 보지 못하기 때문에, 생성된 인스턴스의 내부 상태를 원하는 만큼 변경할 수 있습니다. 왜냐하면 그것들은 개별 HTTP `Session`에 특정하기 때문입니다. HTTP `Session`이 결국 폐기되면, 그 특정 HTTP `Session`에 스코핑된 빈도 폐기됩니다.

어노테이션 기반 컴포넌트나 Java 구성을 사용할 때, `@SessionScope` 어노테이션을 사용하여 컴포넌트를 세션 스코프에 할당할 수 있습니다.

**Java:**

```java
@SessionScope
@Component
public class UserPreferences {
	// ...
}
```

**Kotlin:**

```kotlin
@SessionScope
@Component
class UserPreferences {
	// ...
}
```

#### Application Scope (애플리케이션 스코프)

빈 정의에 대한 다음 XML 구성을 고려하세요:

```xml
<bean id="appPreferences" class="com.something.AppPreferences" scope="application"/>
```

Spring 컨테이너는 전체 웹 애플리케이션에 대해 `appPreferences` 빈 정의를 사용하여 `AppPreferences` 빈의 새 인스턴스를 한 번 생성합니다. 즉, `appPreferences` 빈은 `ServletContext` 레벨에서 스코핑되고 일반 `ServletContext` 속성으로 저장됩니다. 이것은 Spring 싱글톤 빈과 다소 유사하지만 두 가지 중요한 점에서 다릅니다: 그것은 Spring `ApplicationContext`당이 아니라 `ServletContext`당 싱글톤입니다(주어진 웹 애플리케이션에 여러 개가 있을 수 있음), 그리고 실제로 노출되어 `ServletContext` 속성으로 보입니다.

어노테이션 기반 컴포넌트나 Java 구성을 사용할 때, `@ApplicationScope` 어노테이션을 사용하여 컴포넌트를 애플리케이션 스코프에 할당할 수 있습니다. 다음 예제는 그렇게 하는 방법을 보여줍니다:

**Java:**

```java
@ApplicationScope
@Component
public class AppPreferences {
	// ...
}
```

**Kotlin:**

```kotlin
@ApplicationScope
@Component
class AppPreferences {
	// ...
}
```

#### WebSocket Scope (웹소켓 스코프)

WebSocket 스코프는 WebSocket 세션의 생명주기와 연관되어 있으며 STOMP over WebSocket 애플리케이션에 적용됩니다. 자세한 내용은 "WebSocket scope"를 참조하세요.

### Scoped Beans as Dependencies (의존성으로서의 스코프 빈)

Spring IoC 컨테이너는 객체(빈)의 인스턴스화뿐만 아니라 협력자(또는 의존성)의 연결도 관리합니다. 예를 들어 HTTP 요청 스코프 빈을 더 긴 수명의 스코프를 가진 다른 빈에 주입하려는 경우, 스코프 빈 대신 AOP 프록시를 주입하도록 선택할 수 있습니다. 즉, 스코프 객체와 동일한 공개 인터페이스를 노출하지만 관련 스코프(예: HTTP 요청)에서 실제 대상 객체를 검색하고 메서드 호출을 실제 객체에 위임할 수 있는 프록시 객체를 주입해야 합니다.

> `<aop:scoped-proxy/>`를 싱글톤으로 스코핑된 빈 사이에서도 사용할 수 있으며, 참조는 직렬화 가능한 중간 프록시를 거치므로 역직렬화 시 대상 싱글톤 빈을 다시 얻을 수 있습니다.

> 프로토타입 스코프의 빈에 대해 `<aop:scoped-proxy/>`를 선언할 때, 공유 프록시에 대한 모든 메서드 호출은 호출이 전달되는 새 대상 인스턴스의 생성으로 이어집니다.

> 또한, 스코프 프록시는 생명주기 안전(lifecycle-safe) 방식으로 더 짧은 스코프에서 빈에 액세스하는 유일한 방법이 아닙니다. 주입 지점(즉, 생성자 또는 setter 인수 또는 자동 주입 필드)을 `ObjectFactory<MyTargetBean>`으로 선언하여, 인스턴스를 보유하거나 별도로 저장하지 않고 필요할 때마다 현재 인스턴스를 검색하는 `getObject()` 호출을 허용할 수도 있습니다.

> 확장 변형으로, `getIfAvailable` 및 `getIfUnique`를 포함한 여러 추가 액세스 변형을 제공하는 `ObjectProvider<MyTargetBean>`을 선언할 수 있습니다.

> 이것의 JSR-330 변형은 `Provider`라고 하며, 모든 검색 시도마다 `Provider<MyTargetBean>` 선언과 해당 `get()` 호출과 함께 사용됩니다. JSR-330 전체에 대한 자세한 내용은 여기를 참조하세요.

다음 예제의 구성은 한 줄에 불과하지만, 그 뒤에 있는 "왜(why)"와 "어떻게(how)"를 이해하는 것이 중요합니다:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:aop="http://www.springframework.org/schema/aop"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
		https://www.springframework.org/schema/beans/spring-beans.xsd
		http://www.springframework.org/schema/aop
		https://www.springframework.org/schema/aop/spring-aop.xsd">

	<!-- an HTTP Session-scoped bean exposed as a proxy -->
	<bean id="userPreferences" class="com.something.UserPreferences" scope="session">
		<!-- instructs the container to proxy the surrounding bean -->
		<aop:scoped-proxy/> ①
	</bean>

	<!-- a singleton-scoped bean injected with a proxy to the above bean -->
	<bean id="userService" class="com.something.SimpleUserService">
		<!-- a reference to the proxied userPreferences bean -->
		<property name="userPreferences" ref="userPreferences"/>
	</bean>
</beans>
```

① 프록시를 정의하는 라인.

그러한 프록시를 생성하려면, 자식 `<aop:scoped-proxy/>` 요소를 스코프 빈 정의에 삽입합니다("생성할 프록시 유형 선택하기"와 "XML 스키마 기반 구성" 참조).

요청, 세션, 커스텀 스코프 레벨에서 스코핑된 빈의 정의가 일반적인 시나리오에서 `<aop:scoped-proxy/>` 요소를 필요로 하는 이유는 무엇일까요? 다음 싱글톤 빈 정의를 고려하고 앞서 언급한 스코프에 대해 정의해야 할 것과 대조해 보세요(다음 `userPreferences` 빈 정의는 현재 상태로는 불완전합니다):

```xml
<bean id="userPreferences" class="com.something.UserPreferences" scope="session"/>

<bean id="userManager" class="com.something.UserManager">
	<property name="userPreferences" ref="userPreferences"/>
</bean>
```

앞의 예제에서, 싱글톤 빈(`userManager`)은 HTTP `Session` 스코프 빈(`userPreferences`)에 대한 참조와 함께 주입됩니다. 여기서 중요한 점은 `userManager` 빈이 싱글톤이라는 것입니다: 그것은 컨테이너당 정확히 한 번 인스턴스화되며, 그 의존성(이 경우 `userPreferences` 빈 하나만)도 한 번만 주입됩니다. 이것은 `userManager` 빈이 정확히 동일한 `userPreferences` 객체(즉, 원래 주입된 객체)에서만 작동한다는 것을 의미합니다.

이것은 더 짧은 수명의 스코프 빈을 더 긴 수명의 스코프 빈에 주입할 때 원하는 동작이 아닙니다(예를 들어, HTTP `Session` 스코프 협력 빈을 싱글톤 빈에 의존성으로 주입하는 경우). 오히려, 단일 `userManager` 객체가 필요하고, HTTP `Session`의 수명 동안 HTTP `Session`에 특정한 `userPreferences` 객체가 필요합니다. 따라서 컨테이너는 `UserPreferences` 클래스와 정확히 동일한 공개 인터페이스를 노출하는 객체(이상적으로는 `UserPreferences` 인스턴스인 객체)를 생성하며, 이는 스코핑 메커니즘(HTTP 요청, `Session` 등)에서 실제 `UserPreferences` 객체를 가져올 수 있습니다. 컨테이너는 이 프록시 객체를 `userManager` 빈에 주입하며, 이는 이 `UserPreferences` 참조가 프록시라는 것을 인식하지 못합니다. 이 예제에서, `UserManager` 인스턴스가 의존성 주입된 `UserPreferences` 객체의 메서드를 호출할 때, 실제로는 프록시의 메서드를 호출하는 것입니다. 그런 다음 프록시는 (이 경우) HTTP `Session`에서 실제 `UserPreferences` 객체를 가져오고 검색된 실제 `UserPreferences` 객체에 메서드 호출을 위임합니다.

따라서 다음 예제와 같이 요청 및 세션 스코프 빈을 협력 객체에 주입할 때 다음(올바르고 완전한) 구성이 필요합니다:

```xml
<bean id="userPreferences" class="com.something.UserPreferences" scope="session">
	<aop:scoped-proxy/>
</bean>

<bean id="userManager" class="com.something.UserManager">
	<property name="userPreferences" ref="userPreferences"/>
</bean>
```

#### Choosing the Type of Proxy to Create (생성할 프록시 유형 선택하기)

기본적으로, Spring 컨테이너가 `<aop:scoped-proxy/>` 요소로 표시된 빈에 대한 프록시를 생성할 때, CGLIB 기반 클래스 프록시가 생성됩니다.

> CGLIB 프록시는 private 메서드를 가로채지 않습니다. 그러한 프록시에서 private 메서드를 호출하려고 시도하면 실제 스코프 대상 객체에 위임되지 않습니다.

또는, `<aop:scoped-proxy/>` 요소의 `proxy-target-class` 속성 값에 `false`를 지정하여 그러한 스코프 빈에 대한 표준 JDK 인터페이스 기반 프록시를 생성하도록 Spring 컨테이너를 구성할 수 있습니다. JDK 인터페이스 기반 프록시를 사용한다는 것은 그러한 프록시를 적용하기 위해 애플리케이션 클래스 경로에 추가 라이브러리가 필요하지 않다는 것을 의미합니다. 그러나 이것은 또한 스코프 빈의 클래스가 최소한 하나의 인터페이스를 구현해야 하며, 스코프 빈이 주입되는 모든 협력자는 그 인터페이스 중 하나를 통해 빈을 참조해야 한다는 것을 의미합니다. 다음 예제는 인터페이스 기반 프록시를 보여줍니다:

```xml
<!-- DefaultUserPreferences implements the UserPreferences interface -->
<bean id="userPreferences" class="com.stuff.DefaultUserPreferences" scope="session">
	<aop:scoped-proxy proxy-target-class="false"/>
</bean>

<bean id="userManager" class="com.stuff.UserManager">
	<property name="userPreferences" ref="userPreferences"/>
</bean>
```

클래스 기반 또는 인터페이스 기반 프록시 선택에 대한 자세한 정보는 "프록시 메커니즘(Proxying Mechanisms)"을 참조하세요.

#### Injecting Request/Session References Directly (요청/세션 참조 직접 주입하기)

팩토리 스코프의 대안으로, Spring `WebApplicationContext`는 다른 빈에 대한 일반 주입 지점 옆에 타입 기반 자동 주입(type-based autowiring)을 통해 `HttpServletRequest`, `HttpServletResponse`, `HttpSession`, `WebRequest` 및 (JSF가 있는 경우) `FacesContext`와 `ExternalContext`를 Spring 관리 빈에 주입하는 것도 지원합니다. Spring은 일반적으로 그러한 요청 및 세션 객체에 대한 프록시를 주입하며, 이는 팩토리 스코프 빈에 대한 스코프 프록시와 유사하게 싱글톤 빈 및 직렬화 가능한 빈에서도 작동한다는 장점이 있습니다.

### Custom Scopes (커스텀 스코프)

빈 스코핑 메커니즘은 확장 가능합니다. 자신만의 스코프를 정의하거나 기존 스코프를 재정의할 수도 있지만, 후자는 나쁜 관행으로 간주되며 내장된 `singleton` 및 `prototype` 스코프를 재정의할 수 없습니다.

#### Creating a Custom Scope (커스텀 스코프 생성하기)

커스텀 스코프를 Spring 컨테이너에 통합하려면, 이 섹션에서 설명하는 `org.springframework.beans.factory.config.Scope` 인터페이스를 구현해야 합니다. 자신만의 스코프를 구현하는 방법에 대한 아이디어를 얻으려면, Spring Framework 자체와 함께 제공되는 `Scope` 구현과 구현해야 할 메서드를 더 자세히 설명하는 `Scope` javadoc을 참조하세요.

`Scope` 인터페이스에는 스코프에서 객체를 가져오고, 스코프에서 제거하고, 소멸되도록 하는 네 가지 메서드가 있습니다.

예를 들어, 세션 스코프 구현은 세션 스코프 빈을 반환합니다(존재하지 않는 경우, 메서드는 향후 참조를 위해 세션에 바인딩한 후 빈의 새 인스턴스를 반환합니다). 다음 메서드는 기본 스코프에서 객체를 반환합니다:

**Java:**

```java
Object get(String name, ObjectFactory<?> objectFactory)
```

**Kotlin:**

```kotlin
fun get(name: String, objectFactory: ObjectFactory<*>): Any
```

예를 들어, 세션 스코프 구현은 기본 세션에서 세션 스코프 빈을 제거합니다. 객체는 반환되어야 하지만, 지정된 이름의 객체를 찾을 수 없는 경우 null을 반환할 수 있습니다. 다음 메서드는 기본 스코프에서 객체를 제거합니다:

**Java:**

```java
Object remove(String name)
```

**Kotlin:**

```kotlin
fun remove(name: String): Any?
```

다음 메서드는 스코프가 소멸될 때 또는 스코프의 지정된 객체가 소멸될 때 스코프가 호출해야 하는 콜백을 등록합니다:

**Java:**

```java
void registerDestructionCallback(String name, Runnable destructionCallback)
```

**Kotlin:**

```kotlin
fun registerDestructionCallback(name: String, destructionCallback: Runnable)
```

소멸 콜백에 대한 자세한 정보는 javadoc 또는 Spring 스코프 구현을 참조하세요.

다음 메서드는 기본 스코프에 대한 대화 식별자(conversation identifier)를 얻습니다:

**Java:**

```java
String getConversationId()
```

**Kotlin:**

```kotlin
fun getConversationId(): String?
```

이 식별자는 각 스코프마다 다릅니다. 세션 스코프 구현의 경우, 이 식별자는 세션 식별자일 수 있습니다.

#### Using a Custom Scope (커스텀 스코프 사용하기)

하나 이상의 커스텀 `Scope` 구현을 작성하고 테스트한 후, Spring 컨테이너가 새 스코프를 인식하도록 해야 합니다. 다음 메서드는 Spring 컨테이너에 새 `Scope`를 등록하는 중심 메서드입니다:

**Java:**

```java
void registerScope(String scopeName, Scope scope);
```

**Kotlin:**

```kotlin
fun registerScope(scopeName: String, scope: Scope)
```

이 메서드는 `ConfigurableBeanFactory` 인터페이스에 선언되어 있으며, Spring과 함께 제공되는 대부분의 구체적인 `ApplicationContext` 구현의 `BeanFactory` 속성을 통해 사용할 수 있습니다.

`registerScope(..)` 메서드의 첫 번째 인수는 스코프와 연관된 고유한 이름입니다. Spring 컨테이너 자체에서 그러한 이름의 예는 `singleton` 및 `prototype`입니다. `registerScope(..)` 메서드의 두 번째 인수는 등록하고 사용하려는 커스텀 `Scope` 구현의 실제 인스턴스입니다.

커스텀 `Scope` 구현을 작성한 다음 다음 예제와 같이 등록한다고 가정합니다.

> 다음 예제는 Spring에 포함되어 있지만 기본적으로 등록되지 않는 `SimpleThreadScope`를 사용합니다. 지침은 자신의 커스텀 `Scope` 구현에 대해서도 동일합니다.

**Java:**

```java
Scope threadScope = new SimpleThreadScope();
beanFactory.registerScope("thread", threadScope);
```

**Kotlin:**

```kotlin
val threadScope = SimpleThreadScope()
beanFactory.registerScope("thread", threadScope)
```

그런 다음 다음과 같이 커스텀 `Scope`의 스코핑 규칙을 준수하는 빈 정의를 생성할 수 있습니다:

```xml
<bean id="..." class="..." scope="thread">
```

커스텀 `Scope` 구현을 사용하면, 스코프의 프로그래밍 방식 등록에만 제한되지 않습니다. 다음 예제와 같이 `CustomScopeConfigurer` 클래스를 사용하여 `Scope` 등록을 선언적으로 수행할 수도 있습니다:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:aop="http://www.springframework.org/schema/aop"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
		https://www.springframework.org/schema/beans/spring-beans.xsd
		http://www.springframework.org/schema/aop
		https://www.springframework.org/schema/aop/spring-aop.xsd">

	<bean class="org.springframework.beans.factory.config.CustomScopeConfigurer">
		<property name="scopes">
			<map>
				<entry key="thread">
					<bean class="org.springframework.context.support.SimpleThreadScope"/>
				</entry>
			</map>
		</property>
	</bean>

	<bean id="thing2" class="x.y.Thing2" scope="thread">
		<property name="name" value="Rick"/>
		<aop:scoped-proxy/>
	</bean>

	<bean id="thing1" class="x.y.Thing1">
		<property name="thing2" ref="thing2"/>
	</bean>

</beans>
```

> `FactoryBean` 구현에 대한 `<bean>` 선언 내에 `<aop:scoped-proxy/>`를 배치하면, 스코핑되는 것은 `getObject()`에서 반환되는 객체가 아니라 팩토리 빈 자체입니다.
