---
title: "Additional Capabilities of the ApplicationContext"
description: "Spring의 `ApplicationContext`는 기본적인 `BeanFactory`의 기능을 넘어서 엔터프라이즈 애플리케이션 프레임워크에 적합한 다양한 추가 기능을 제공합니다. 주요 기능으로는 국제화를 위한 `MessageSource`, URL 및 파일 접근을 위한 `ResourceLoader`, 이벤트 발행을 위한 `ApplicationEventPublisher`, 그리고 계층적 컨텍스트를 지원하는 `HierarchicalBeanFactory` 인터페이스가 있습니다. 특히 이벤트 처리 메커니즘은 Spring 4.2부터 어노테이션 기반 모델(`@EventListener`)을 지원하며, 비동기 이벤트 처리, 이벤트 순서 제어, 제네릭 이벤트 등 다양한 고급 기능을 제공합니다."
pubDate: "2026-03-10"
tags: ["Resources/translations/spring/core/ioc-container"]
contentSource: "ai-assisted"
series: "Spring IoC Container"
seriesOrder: 23
draft: false
---

# Additional Capabilities of the ApplicationContext

> 원문: [Additional Capabilities of the ApplicationContext](https://docs.spring.io/spring-framework/reference/core/beans/context-introduction.html)

## 전문 번역

[챕터 소개](introduction.html)에서 논의한 바와 같이, `org.springframework.beans.factory` 패키지는 프로그래밍 방식을 포함하여 빈을 관리하고 조작하기 위한 기본 기능을 제공합니다. `org.springframework.context` 패키지는 `BeanFactory` 인터페이스를 확장하는 [`ApplicationContext`](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/context/ApplicationContext.html) 인터페이스를 추가하며, 더 많은 애플리케이션 프레임워크 지향적인 스타일로 추가 기능을 제공하기 위해 다른 인터페이스들도 확장합니다. 많은 사람들이 `ApplicationContext`를 완전히 선언적인 방식으로 사용하며, 프로그래밍 방식으로 생성하지 않고 대신 `ContextLoader`와 같은 지원 클래스에 의존하여 Jakarta EE 웹 애플리케이션의 정상적인 시작 프로세스의 일부로 `ApplicationContext`를 자동으로 인스턴스화합니다.

`BeanFactory` 기능을 더 프레임워크 지향적인 스타일로 향상시키기 위해, context 패키지는 다음과 같은 기능도 제공합니다:

- `MessageSource` 인터페이스를 통한 i18n 스타일의 메시지 접근
- `ResourceLoader` 인터페이스를 통한 URL 및 파일과 같은 리소스 접근
- `ApplicationEventPublisher` 인터페이스의 사용을 통해 `ApplicationListener` 인터페이스를 구현하는 빈에 대한 이벤트 발행
- `HierarchicalBeanFactory` 인터페이스를 통해 애플리케이션의 웹 계층과 같이 특정 계층에 집중된 여러 (계층적) 컨텍스트 로딩

### Internationalization using MessageSource

`ApplicationContext` 인터페이스는 `MessageSource`라는 인터페이스를 확장하므로 국제화("i18n") 기능을 제공합니다. Spring은 또한 메시지를 계층적으로 해결할 수 있는 `HierarchicalMessageSource` 인터페이스를 제공합니다. 이러한 인터페이스들이 함께 Spring이 메시지 해결을 수행하는 기반을 제공합니다. 이러한 인터페이스에 정의된 메서드는 다음과 같습니다:

- `String getMessage(String code, Object[] args, String default, Locale loc)`: `MessageSource`에서 메시지를 검색하는 데 사용되는 기본 메서드입니다. 지정된 로케일에 대한 메시지를 찾을 수 없으면 기본 메시지가 사용됩니다. 전달된 인수는 표준 라이브러리에서 제공하는 `MessageFormat` 기능을 사용하여 대체 값이 됩니다.
- `String getMessage(String code, Object[] args, Locale loc)`: 기본적으로 이전 메서드와 동일하지만 한 가지 차이점이 있습니다: 기본 메시지를 지정할 수 없습니다. 메시지를 찾을 수 없으면 `NoSuchMessageException`이 발생합니다.
- `String getMessage(MessageSourceResolvable resolvable, Locale locale)`: 앞의 메서드에서 사용된 모든 속성도 `MessageSourceResolvable`이라는 클래스로 래핑되며, 이 메서드와 함께 사용할 수 있습니다.

`ApplicationContext`가 로드되면 컨텍스트에 정의된 `MessageSource` 빈을 자동으로 검색합니다. 빈은 `messageSource`라는 이름을 가져야 합니다. 그러한 빈이 발견되면 앞의 메서드에 대한 모든 호출이 메시지 소스에 위임됩니다. 메시지 소스가 발견되지 않으면 `ApplicationContext`는 동일한 이름을 가진 빈을 포함하는 부모를 찾으려고 시도합니다. 찾으면 해당 빈을 `MessageSource`로 사용합니다. `ApplicationContext`가 메시지에 대한 소스를 찾을 수 없으면 위에서 정의된 메서드에 대한 호출을 수락할 수 있도록 빈 `DelegatingMessageSource`가 인스턴스화됩니다.

Spring은 세 가지 `MessageSource` 구현체를 제공합니다: `ResourceBundleMessageSource`, `ReloadableResourceBundleMessageSource`, `StaticMessageSource`입니다. 모두 중첩된 메시징을 수행하기 위해 `HierarchicalMessageSource`를 구현합니다. `StaticMessageSource`는 거의 사용되지 않지만 소스에 메시지를 추가하는 프로그래밍 방식을 제공합니다. 다음 예제는 `ResourceBundleMessageSource`를 보여줍니다:

```xml
<beans>
	<bean id="messageSource" class="org.springframework.context.support.ResourceBundleMessageSource">
		<property name="basenames">
			<list>
				<value>format</value>
				<value>exceptions</value>
				<value>windows</value>
			</list>
		</property>
	</bean>
</beans>
```

이 예제는 classpath에 정의된 `format`, `exceptions`, `windows`라는 세 개의 리소스 번들이 있다고 가정합니다. 메시지를 해결하기 위한 모든 요청은 `ResourceBundle` 객체를 통해 메시지를 해결하는 JDK 표준 방식으로 처리됩니다. 예제의 목적상 위의 두 리소스 번들 파일의 내용이 다음과 같다고 가정합니다:

```properties
# in format.properties
message=Alligators rock!
```

```properties
# in exceptions.properties
argument.required=The {0} argument is required.
```

다음 예제는 `MessageSource` 기능을 실행하는 프로그램을 보여줍니다. 모든 `ApplicationContext` 구현체는 또한 `MessageSource` 구현체이므로 `MessageSource` 인터페이스로 캐스팅할 수 있습니다.

**Java:**
```java
public static void main(String[] args) {
	MessageSource resources = new ClassPathXmlApplicationContext("beans.xml");
	String message = resources.getMessage("message", null, "Default", Locale.ENGLISH);
	System.out.println(message);
}
```

위 프로그램의 결과 출력은 다음과 같습니다:

```
Alligators rock!
```

요약하자면, `MessageSource`는 classpath의 루트에 존재하는 `beans.xml`이라는 파일에 정의되어 있습니다. `messageSource` 빈 정의는 `basenames` 속성을 통해 여러 리소스 번들을 참조합니다. `basenames` 속성의 리스트에 전달된 세 파일은 classpath의 루트에 파일로 존재하며 각각 `format.properties`, `exceptions.properties`, `windows.properties`라고 합니다.

다음 예제는 메시지 조회에 전달된 인수를 보여줍니다. 이러한 인수는 `String` 객체로 변환되어 조회 메시지의 자리 표시자에 삽입됩니다.

```xml
<beans>
	<!-- this MessageSource is being used in a web application -->
	<bean id="messageSource" class="org.springframework.context.support.ResourceBundleMessageSource">
		<property name="basename" value="exceptions"/>
	</bean>

	<!-- lets inject the above MessageSource into this POJO -->
	<bean id="example" class="com.something.Example">
		<property name="messages" ref="messageSource"/>
	</bean>
</beans>
```

**Java:**
```java
public class Example {
	private MessageSource messages;

	public void setMessages(MessageSource messages) {
		this.messages = messages;
	}

	public void execute() {
		String message = this.messages.getMessage("argument.required",
			new Object [] {"userDao"}, "Required", Locale.ENGLISH);
		System.out.println(message);
	}
}
```

`execute()` 메서드의 호출 결과 출력은 다음과 같습니다:

```
The userDao argument is required.
```

국제화("i18n")와 관련하여, Spring의 다양한 `MessageSource` 구현체는 표준 JDK `ResourceBundle`과 동일한 로케일 해결 및 폴백 규칙을 따릅니다. 간단히 말해서, 이전에 정의된 예제 `messageSource`를 계속 사용하여, 영국(`en-GB`) 로케일에 대해 메시지를 해결하려면 각각 `format_en_GB.properties`, `exceptions_en_GB.properties`, `windows_en_GB.properties`라는 파일을 생성합니다.

일반적으로 로케일 해결은 애플리케이션의 주변 환경에 의해 관리됩니다. 다음 예제에서는 (영국) 메시지가 해결되는 로케일이 수동으로 지정됩니다:

```properties
# in exceptions_en_GB.properties
argument.required=Ebagum lad, the ''{0}'' argument is required, I say, required.
```

**Java:**
```java
public static void main(final String[] args) {
	MessageSource resources = new ClassPathXmlApplicationContext("beans.xml");
	String message = resources.getMessage("argument.required",
		new Object [] {"userDao"}, "Required", Locale.UK);
	System.out.println(message);
}
```

위 프로그램을 실행한 결과 출력은 다음과 같습니다:

```
Ebagum lad, the 'userDao' argument is required, I say, required.
```

`MessageSourceAware` 인터페이스를 사용하여 정의된 모든 `MessageSource`에 대한 참조를 얻을 수도 있습니다. `MessageSourceAware` 인터페이스를 구현하는 `ApplicationContext`에 정의된 모든 빈은 빈이 생성되고 구성될 때 애플리케이션 컨텍스트의 `MessageSource`가 주입됩니다.

> **참고**: Spring의 `MessageSource`는 Java의 `ResourceBundle`을 기반으로 하기 때문에 동일한 기본 이름을 가진 번들을 병합하지 않고 찾은 첫 번째 번들만 사용합니다. 동일한 기본 이름을 가진 후속 메시지 번들은 무시됩니다.

> **참고**: `ResourceBundleMessageSource`의 대안으로 Spring은 `ReloadableResourceBundleMessageSource` 클래스를 제공합니다. 이 변형은 동일한 번들 파일 형식을 지원하지만 표준 JDK 기반 `ResourceBundleMessageSource` 구현보다 더 유연합니다. 특히 classpath뿐만 아니라 모든 Spring 리소스 위치에서 파일을 읽을 수 있으며 번들 속성 파일의 핫 리로딩을 지원합니다(중간에 효율적으로 캐싱함). 자세한 내용은 [`ReloadableResourceBundleMessageSource`](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/context/support/ReloadableResourceBundleMessageSource.html) javadoc을 참조하십시오.

### Standard and Custom Events

`ApplicationContext`의 이벤트 처리는 `ApplicationEvent` 클래스와 `ApplicationListener` 인터페이스를 통해 제공됩니다. `ApplicationListener` 인터페이스를 구현하는 빈이 컨텍스트에 배포되면 `ApplicationEvent`가 `ApplicationContext`에 발행될 때마다 해당 빈이 통지됩니다. 본질적으로 이것은 표준 옵저버 디자인 패턴입니다.

> **팁**: Spring 4.2부터 이벤트 인프라가 크게 개선되어 [어노테이션 기반 모델](#annotation-based-event-listeners)뿐만 아니라 임의의 이벤트(즉, `ApplicationEvent`에서 반드시 확장되지 않는 객체)를 발행할 수 있는 기능을 제공합니다. 그러한 객체가 발행되면 이벤트로 래핑됩니다.

다음 표는 Spring이 제공하는 표준 이벤트를 설명합니다:

**표 1. 내장 이벤트**

| 이벤트 | 설명 |
|--------|------|
| `ContextRefreshedEvent` | `ApplicationContext`가 초기화되거나 새로 고쳐질 때 발행됩니다(예: `ConfigurableApplicationContext` 인터페이스의 `refresh()` 메서드 사용). 여기서 "초기화됨"은 모든 빈이 로드되고, 후처리기 빈이 감지되고 활성화되며, 싱글톤이 사전 인스턴스화되고, `ApplicationContext` 객체가 사용할 준비가 되었음을 의미합니다. 컨텍스트가 닫히지 않은 한, 선택한 `ApplicationContext`가 실제로 그러한 "핫" 새로 고침을 지원하는 경우 새로 고침을 여러 번 트리거할 수 있습니다. 예를 들어 `XmlWebApplicationContext`는 핫 새로 고침을 지원하지만 `GenericApplicationContext`는 그렇지 않습니다. |
| `ContextStartedEvent` | `ConfigurableApplicationContext` 인터페이스의 `start()` 메서드를 사용하여 `ApplicationContext`가 시작될 때 발행됩니다. 여기서 "시작됨"은 모든 `Lifecycle` 빈이 명시적 시작 신호를 받는다는 것을 의미합니다. 일반적으로 이 신호는 명시적 중지 후 빈을 다시 시작하는 데 사용되지만 자동 시작으로 구성되지 않은 구성 요소(예: 초기화 시 아직 시작되지 않은 구성 요소)를 시작하는 데도 사용될 수 있습니다. |
| `ContextStoppedEvent` | `ConfigurableApplicationContext` 인터페이스의 `stop()` 메서드를 사용하여 `ApplicationContext`가 중지될 때 발행됩니다. 여기서 "중지됨"은 모든 `Lifecycle` 빈이 명시적 중지 신호를 받는다는 것을 의미합니다. 중지된 컨텍스트는 `start()` 호출을 통해 다시 시작될 수 있습니다. |
| `ContextClosedEvent` | `ConfigurableApplicationContext` 인터페이스의 `close()` 메서드를 사용하거나 JVM 종료 후크를 통해 `ApplicationContext`가 닫힐 때 발행됩니다. 여기서 "닫힘"은 모든 싱글톤 빈이 소멸된다는 것을 의미합니다. 컨텍스트가 닫히면 수명이 끝나며 새로 고치거나 다시 시작할 수 없습니다. |
| `RequestHandledEvent` | HTTP 요청이 서비스되었음을 모든 빈에 알리는 웹 특정 이벤트입니다. 이 이벤트는 요청이 완료된 후 발행됩니다. 이 이벤트는 Spring의 `DispatcherServlet`을 사용하는 웹 애플리케이션에만 적용됩니다. |
| `ServletRequestHandledEvent` | Servlet 특정 컨텍스트 정보를 추가하는 `RequestHandledEvent`의 하위 클래스입니다. |

사용자 정의 이벤트를 생성하고 발행할 수도 있습니다. 다음 예제는 Spring의 `ApplicationEvent` 기본 클래스를 확장하는 간단한 클래스를 보여줍니다:

**Java:**
```java
public class BlockedListEvent extends ApplicationEvent {
	private final String address;
	private final String content;

	public BlockedListEvent(Object source, String address, String content) {
		super(source);
		this.address = address;
		this.content = content;
	}
	// accessor and other methods...
}
```

사용자 정의 `ApplicationEvent`를 발행하려면 `ApplicationEventPublisher`의 `publishEvent()` 메서드를 호출합니다. 일반적으로 이는 `ApplicationEventPublisherAware`를 구현하고 Spring 빈으로 등록하는 클래스를 생성하여 수행됩니다. 다음 예제는 그러한 클래스를 보여줍니다:

**Java:**
```java
public class EmailService implements ApplicationEventPublisherAware {
	private List<String> blockedList;
	private ApplicationEventPublisher publisher;

	public void setBlockedList(List<String> blockedList) {
		this.blockedList = blockedList;
	}

	public void setApplicationEventPublisher(ApplicationEventPublisher publisher) {
		this.publisher = publisher;
	}

	public void sendEmail(String address, String content) {
		if (blockedList.contains(address)) {
			publisher.publishEvent(new BlockedListEvent(this, address, content));
			return;
		}
		// send email...
	}
}
```

구성 시 Spring 컨테이너는 `EmailService`가 `ApplicationEventPublisherAware`를 구현한다는 것을 감지하고 자동으로 `setApplicationEventPublisher()`를 호출합니다. 실제로 전달되는 매개변수는 Spring 컨테이너 자체입니다. `ApplicationEventPublisher` 인터페이스를 통해 애플리케이션 컨텍스트와 상호 작용하고 있습니다.

사용자 정의 `ApplicationEvent`를 수신하려면 `ApplicationListener`를 구현하고 Spring 빈으로 등록하는 클래스를 생성할 수 있습니다. 다음 예제는 그러한 클래스를 보여줍니다:

**Java:**
```java
public class BlockedListNotifier implements ApplicationListener<BlockedListEvent> {
	private String notificationAddress;

	public void setNotificationAddress(String notificationAddress) {
		this.notificationAddress = notificationAddress;
	}

	public void onApplicationEvent(BlockedListEvent event) {
		// notify appropriate parties via notificationAddress...
	}
}
```

`ApplicationListener`는 사용자 정의 이벤트의 타입으로 일반적으로 매개변수화됩니다(앞의 예제에서는 `BlockedListEvent`). 이는 `onApplicationEvent()` 메서드가 다운캐스팅 없이 타입 안전하게 유지될 수 있음을 의미합니다. 원하는 만큼 많은 이벤트 리스너를 등록할 수 있지만, 기본적으로 이벤트 리스너는 이벤트를 동기적으로 수신합니다. 이는 `publishEvent()` 메서드가 모든 리스너가 이벤트 처리를 완료할 때까지 차단됨을 의미합니다. 이 동기적이고 단일 스레드 접근 방식의 한 가지 장점은 리스너가 이벤트를 수신할 때 트랜잭션 컨텍스트를 사용할 수 있는 경우 발행자의 트랜잭션 컨텍스트 내에서 작동한다는 것입니다. 예를 들어 기본적으로 비동기 이벤트 처리와 같은 이벤트 발행을 위한 다른 전략이 필요한 경우 Spring의 [`ApplicationEventMulticaster`](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/context/event/ApplicationEventMulticaster.html) 인터페이스와 사용자 정의 "applicationEventMulticaster" 빈 정의에 적용할 수 있는 구성 옵션을 위한 [`SimpleApplicationEventMulticaster`](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/context/event/SimpleApplicationEventMulticaster.html) 구현체에 대한 javadoc을 참조하십시오. 이러한 경우 ThreadLocals 및 로깅 컨텍스트는 이벤트 처리에 전파되지 않습니다. 관찰성 문제에 대한 자세한 내용은 [@EventListener 관찰성 섹션](../../integration/observability.html#observability.application-events)을 참조하십시오.

다음 예제는 위의 각 클래스를 등록하고 구성하는 데 사용되는 빈 정의를 보여줍니다:

```xml
<bean id="emailService" class="example.EmailService">
	<property name="blockedList">
		<list>
			<value>known.spammer@example.org</value>
			<value>known.hacker@example.org</value>
			<value>john.doe@example.org</value>
		</list>
	</property>
</bean>

<bean id="blockedListNotifier" class="example.BlockedListNotifier">
	<property name="notificationAddress" value="blockedlist@example.org"/>
</bean>

<!-- optional: a custom ApplicationEventMulticaster definition -->
<bean id="applicationEventMulticaster" class="org.springframework.context.event.SimpleApplicationEventMulticaster">
	<property name="taskExecutor" ref="..."/>
	<property name="errorHandler" ref="..."/>
</bean>
```

모든 것을 종합하면, `emailService` 빈의 `sendEmail()` 메서드가 호출될 때 차단되어야 하는 이메일 메시지가 있으면 `BlockedListEvent` 타입의 사용자 정의 이벤트가 발행됩니다. `blockedListNotifier` 빈은 `ApplicationListener`로 등록되어 `BlockedListEvent`를 수신하며, 이 시점에서 적절한 당사자에게 통지할 수 있습니다.

> **참고**: Spring의 이벤트 메커니즘은 동일한 애플리케이션 컨텍스트 내의 Spring 빈 간의 간단한 통신을 위해 설계되었습니다. 그러나 더 정교한 엔터프라이즈 통합 요구 사항의 경우, 별도로 유지 관리되는 [Spring Integration](https://spring.io/projects/spring-integration/) 프로젝트는 잘 알려진 Spring 프로그래밍 모델을 기반으로 구축된 경량, [패턴 지향](https://www.enterpriseintegrationpatterns.com), 이벤트 기반 아키텍처를 구축하기 위한 완전한 지원을 제공합니다.

#### Annotation-based Event Listeners

`@EventListener` 어노테이션을 사용하여 관리되는 빈의 모든 메서드에 이벤트 리스너를 등록할 수 있습니다. `BlockedListNotifier`는 다음과 같이 다시 작성할 수 있습니다:

**Java:**
```java
public class BlockedListNotifier {
	private String notificationAddress;

	public void setNotificationAddress(String notificationAddress) {
		this.notificationAddress = notificationAddress;
	}

	@EventListener
	public void processBlockedListEvent(BlockedListEvent event) {
		// notify appropriate parties via notificationAddress...
	}
}
```

> **참고**: `ApplicationContext`가 이를 준수하고 이벤트를 수신하도록 메서드를 등록하지 않으므로 이러한 빈을 lazy로 정의하지 마십시오.

메서드 시그니처는 수신하는 이벤트 타입을 다시 선언하지만, 이번에는 유연한 이름을 사용하고 특정 리스너 인터페이스를 구현하지 않습니다. 실제 이벤트 타입이 구현 계층에서 제네릭 매개변수를 해결하는 한 제네릭을 통해 이벤트 타입을 좁힐 수도 있습니다.

메서드가 여러 이벤트를 수신해야 하거나 매개변수 없이 정의하려는 경우 이벤트 타입을 어노테이션 자체에 지정할 수도 있습니다. 다음 예제는 그 방법을 보여줍니다:

**Java:**
```java
@EventListener({ContextStartedEvent.class, ContextRefreshedEvent.class})
public void handleContextStart() {
	// ...
}
```

특정 이벤트에 대해 실제로 메서드를 호출하기 위해 일치해야 하는 [SpEL 표현식](../expressions.html)을 정의하는 어노테이션의 `condition` 속성을 사용하여 추가 런타임 필터링을 추가할 수도 있습니다.

다음 예제는 이벤트의 `content` 속성이 `my-event`와 같은 경우에만 호출되도록 notifier를 다시 작성하는 방법을 보여줍니다:

**Java:**
```java
@EventListener(condition = "#blEvent.content == 'my-event'")
public void processBlockedListEvent(BlockedListEvent blEvent) {
	// notify appropriate parties via notificationAddress...
}
```

각 `SpEL` 표현식은 전용 컨텍스트에 대해 평가됩니다. 다음 표는 조건부 이벤트 처리에 사용할 수 있도록 컨텍스트에서 사용할 수 있는 항목을 나열합니다:

**표 2. SpEL 표현식에서 사용 가능한 이벤트 메타데이터**

| 이름 | 위치 | 설명 | 예제 |
|------|------|------|------|
| Event | root object | 실제 `ApplicationEvent`. | `#root.event` 또는 `event` |
| Arguments array | root object | 메서드를 호출하는 데 사용된 인수(객체 배열로). | `#root.args` 또는 `args`; `args[0]`으로 첫 번째 인수에 접근 등. |
| *Argument name* | evaluation context | 특정 메서드 인수의 이름. 이름을 사용할 수 없는 경우(예: `-parameters` 플래그 없이 코드를 컴파일했기 때문에) 개별 인수는 `#a<#arg>` 구문을 사용하여 사용할 수 있으며, 여기서 `<#arg>`는 인수 인덱스(0부터 시작)를 나타냅니다. | `#blEvent` 또는 `#a0`(별칭으로 `#p0` 또는 `#p<#arg>` 매개변수 표기법도 사용할 수 있음) |

`#root.event`는 메서드 시그니처가 실제로 발행된 임의의 객체를 참조하더라도 기본 이벤트에 대한 액세스를 제공합니다.

다른 이벤트를 처리한 결과로 이벤트를 발행해야 하는 경우 다음 예제와 같이 발행해야 하는 이벤트를 반환하도록 메서드 시그니처를 변경할 수 있습니다:

**Java:**
```java
@EventListener
public ListUpdateEvent handleBlockedListEvent(BlockedListEvent event) {
	// notify appropriate parties via notificationAddress and
	// then publish a ListUpdateEvent...
}
```

> **참고**: 이 기능은 [비동기 리스너](#asynchronous-listeners)에 대해 지원되지 않습니다.

`handleBlockedListEvent()` 메서드는 처리하는 모든 `BlockedListEvent`에 대해 새 `ListUpdateEvent`를 발행합니다. 여러 이벤트를 발행해야 하는 경우 대신 이벤트의 `Collection` 또는 배열을 반환할 수 있습니다.

#### Asynchronous Listeners

특정 리스너가 이벤트를 비동기적으로 처리하도록 하려면 일반 [`@Async` 지원](../../integration/scheduling.html#scheduling-annotation-support-async)을 재사용할 수 있습니다. 다음 예제는 그 방법을 보여줍니다:

**Java:**
```java
@EventListener
@Async
public void processBlockedListEvent(BlockedListEvent event) {
	// BlockedListEvent is processed in a separate thread
}
```

비동기 이벤트를 사용할 때 다음 제한 사항에 유의하십시오:

- 비동기 이벤트 리스너가 `Exception`을 던지면 호출자에게 전파되지 않습니다. 자세한 내용은 [`AsyncUncaughtExceptionHandler`](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/aop/interceptor/AsyncUncaughtExceptionHandler.html)를 참조하십시오.
- 비동기 이벤트 리스너 메서드는 값을 반환하여 후속 이벤트를 발행할 수 없습니다. 처리 결과로 다른 이벤트를 발행해야 하는 경우 [`ApplicationEventPublisher`](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/context/ApplicationEventPublisher.html)를 주입하여 이벤트를 수동으로 발행하십시오.
- ThreadLocals 및 로깅 컨텍스트는 기본적으로 이벤트 처리에 전파되지 않습니다. 관찰성 문제에 대한 자세한 내용은 [@EventListener 관찰성 섹션](../../integration/observability.html#observability.application-events)을 참조하십시오.

#### Ordering Listeners

한 리스너가 다른 리스너보다 먼저 호출되어야 하는 경우 다음 예제와 같이 메서드 선언에 `@Order` 어노테이션을 추가할 수 있습니다:

**Java:**
```java
@EventListener
@Order(42)
public void processBlockedListEvent(BlockedListEvent event) {
	// notify appropriate parties via notificationAddress...
}
```

#### Generic Events

제네릭을 사용하여 이벤트의 구조를 더 정의할 수도 있습니다. `EntityCreatedEvent<T>`를 사용하는 것을 고려하십시오. 여기서 `T`는 생성된 실제 엔티티의 타입입니다. 예를 들어 다음 리스너 정의를 생성하여 `Person`에 대한 `EntityCreatedEvent`만 수신할 수 있습니다:

**Java:**
```java
@EventListener
public void onPersonCreated(EntityCreatedEvent<Person> event) {
	// ...
}
```

타입 소거로 인해 이는 발행된 이벤트가 이벤트 리스너가 필터링하는 제네릭 매개변수를 해결하는 경우에만 작동합니다(즉, `class PersonCreatedEvent extends EntityCreatedEvent<Person> { … }`와 같은 것).

특정 상황에서 모든 이벤트가 동일한 구조를 따르는 경우(앞의 예제의 이벤트와 같이) 상당히 지루해질 수 있습니다. 그러한 경우 `ResolvableTypeProvider`를 구현하여 런타임 환경이 제공하는 것 이상으로 프레임워크를 안내할 수 있습니다. 다음 이벤트는 그 방법을 보여줍니다:

**Java:**
```java
public class EntityCreatedEvent<T> extends ApplicationEvent implements ResolvableTypeProvider {

	public EntityCreatedEvent(T entity) {
		super(entity);
	}

	@Override
	public ResolvableType getResolvableType() {
		return ResolvableType.forClassWithGenerics(getClass(),
			ResolvableType.forInstance(getSource()));
	}
}
```

> **팁**: 이것은 `ApplicationEvent`뿐만 아니라 이벤트로 보내는 모든 임의의 객체에 대해 작동합니다.

마지막으로, 클래식 `ApplicationListener` 구현체와 마찬가지로 실제 멀티캐스팅은 런타임에 컨텍스트 전체 `ApplicationEventMulticaster`를 통해 발생합니다. 기본적으로 이것은 호출자 스레드에서 동기 이벤트 발행을 하는 `SimpleApplicationEventMulticaster`입니다. 예를 들어 모든 이벤트를 비동기적으로 처리하거나 리스너 예외를 처리하기 위해 "applicationEventMulticaster" 빈 정의를 통해 교체/사용자 정의할 수 있습니다:

**Java:**
```java
@Bean
ApplicationEventMulticaster applicationEventMulticaster() {
	SimpleApplicationEventMulticaster multicaster = new SimpleApplicationEventMulticaster();
	multicaster.setTaskExecutor(...);
	multicaster.setErrorHandler(...);
	return multicaster;
}
```

### Convenient Access to Low-level Resources

애플리케이션 컨텍스트의 최적 사용 및 이해를 위해 [Resources](../resources.html)에 설명된 대로 Spring의 `Resource` 추상화에 익숙해져야 합니다.

애플리케이션 컨텍스트는 `Resource` 객체를 로드하는 데 사용할 수 있는 `ResourceLoader`입니다. `Resource`는 본질적으로 JDK `java.net.URL` 클래스의 더 기능이 풍부한 버전입니다. 실제로 `Resource`의 구현체는 적절한 경우 `java.net.URL`의 인스턴스를 래핑합니다. `Resource`는 classpath, 파일 시스템 위치, 표준 URL로 설명 가능한 모든 곳 및 기타 변형을 포함하여 거의 모든 위치에서 투명한 방식으로 하위 수준 리소스를 얻을 수 있습니다. 리소스 위치 문자열이 특수 접두사가 없는 단순 경로인 경우, 해당 리소스가 어디에서 오는지는 실제 애플리케이션 컨텍스트 타입에 특정하고 적절합니다.

애플리케이션 컨텍스트에 배포된 빈을 특수 콜백 인터페이스인 `ResourceLoaderAware`를 구현하도록 구성하여 초기화 시 애플리케이션 컨텍스트 자체가 `ResourceLoader`로 전달되어 자동으로 콜백될 수 있습니다. 정적 리소스에 액세스하는 데 사용되는 `Resource` 타입의 속성을 노출할 수도 있습니다. 다른 속성처럼 주입됩니다. 해당 `Resource` 속성을 단순 `String` 경로로 지정하고 빈이 배포될 때 해당 텍스트 문자열에서 실제 `Resource` 객체로의 자동 변환에 의존할 수 있습니다.

`ApplicationContext` 생성자에 제공된 위치 경로는 실제로 리소스 문자열이며, 단순한 형태로는 특정 컨텍스트 구현에 따라 적절하게 처리됩니다. 예를 들어 `ClassPathXmlApplicationContext`는 단순 위치 경로를 classpath 위치로 처리합니다. 실제 컨텍스트 타입에 관계없이 classpath 또는 URL에서 정의를 강제로 로드하기 위해 특수 접두사가 있는 위치 경로(리소스 문자열)를 사용할 수도 있습니다.

### Application Startup Tracking

`ApplicationContext`는 Spring 애플리케이션의 라이프사이클을 관리하고 구성 요소 주위에 풍부한 프로그래밍 모델을 제공합니다. 결과적으로 복잡한 애플리케이션은 똑같이 복잡한 구성 요소 그래프와 시작 단계를 가질 수 있습니다.

특정 메트릭으로 애플리케이션 시작 단계를 추적하면 시작 단계 동안 시간이 어디에 소비되는지 이해하는 데 도움이 될 수 있지만, 전체적으로 컨텍스트 라이프사이클을 더 잘 이해하는 방법으로도 사용할 수 있습니다.

`AbstractApplicationContext`(및 그 하위 클래스)는 다양한 시작 단계에 대한 `StartupStep` 데이터를 수집하는 `ApplicationStartup`으로 계측됩니다:

- 애플리케이션 컨텍스트 라이프사이클 (기본 패키지 스캐닝, 구성 클래스 관리)
- 빈 라이프사이클 (인스턴스화, 스마트 초기화, 후처리)
- 애플리케이션 이벤트 처리

다음은 `AnnotationConfigApplicationContext`의 계측 예제입니다:

**Java:**
```java
// create a startup step and start recording
try (StartupStep scanPackages = getApplicationStartup().start("spring.context.base-packages.scan")) {
	// add tagging information to the current step
	scanPackages.tag("packages", () -> Arrays.toString(basePackages));
	// perform the actual phase we're instrumenting
	this.scanner.scan(basePackages);
}
```

애플리케이션 컨텍스트는 이미 여러 단계로 계측되어 있습니다. 기록되면 이러한 시작 단계는 특정 도구로 수집, 표시 및 분석할 수 있습니다. 기존 시작 단계의 전체 목록은 [전용 부록 섹션](../appendix/application-startup-steps.html)을 확인하십시오.

기본 `ApplicationStartup` 구현체는 최소 오버헤드를 위한 no-op 변형입니다. 이는 기본적으로 애플리케이션 시작 중에 메트릭이 수집되지 않음을 의미합니다. Spring Framework는 Java Flight Recorder로 시작 단계를 추적하기 위한 구현체인 `FlightRecorderApplicationStartup`과 함께 제공됩니다. 이 변형을 사용하려면 생성되자마자 `ApplicationContext`에 인스턴스를 구성해야 합니다.

개발자는 자체 `AbstractApplicationContext` 하위 클래스를 제공하거나 더 정확한 데이터를 수집하려는 경우 `ApplicationStartup` 인프라를 사용할 수도 있습니다.

> **경고**: `ApplicationStartup`은 애플리케이션 시작 중과 핵심 컨테이너에만 사용되도록 의도되었습니다. 이것은 Micrometer와 같은 Java 프로파일러 또는 메트릭 라이브러리의 대체품이 아닙니다.

사용자 정의 `StartupStep` 수집을 시작하려면 구성 요소가 애플리케이션 컨텍스트에서 직접 `ApplicationStartup` 인스턴스를 가져오거나, 구성 요소가 `ApplicationStartupAware`를 구현하도록 하거나, 모든 주입 지점에서 `ApplicationStartup` 타입을 요청할 수 있습니다.

> **참고**: 개발자는 사용자 정의 시작 단계를 생성할 때 `"spring.*"` 네임스페이스를 사용해서는 안 됩니다. 이 네임스페이스는 내부 Spring 사용을 위해 예약되어 있으며 변경될 수 있습니다.

### Convenient ApplicationContext Instantiation for Web Applications

예를 들어 `ContextLoader`를 사용하여 `ApplicationContext` 인스턴스를 선언적으로 생성할 수 있습니다. 물론 `ApplicationContext` 구현체 중 하나를 사용하여 프로그래밍 방식으로 `ApplicationContext` 인스턴스를 생성할 수도 있습니다.

다음 예제와 같이 `ContextLoaderListener`를 사용하여 `ApplicationContext`를 등록할 수 있습니다:

```xml
<context-param>
	<param-name>contextConfigLocation</param-name>
	<param-value>/WEB-INF/daoContext.xml /WEB-INF/applicationContext.xml</param-value>
</context-param>

<listener>
	<listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
</listener>
```

리스너는 `contextConfigLocation` 매개변수를 검사합니다. 매개변수가 존재하지 않으면 리스너는 `/WEB-INF/applicationContext.xml`을 기본값으로 사용합니다. 매개변수가 존재하면 리스너는 미리 정의된 구분 기호(쉼표, 세미콜론 및 공백)를 사용하여 `String`을 구분하고 값을 애플리케이션 컨텍스트가 검색되는 위치로 사용합니다. Ant 스타일 경로 패턴도 지원됩니다. 예를 들어 `/WEB-INF/*Context.xml`(이름이 `Context.xml`로 끝나고 `WEB-INF` 디렉토리에 있는 모든 파일) 및 `/WEB-INF/**/*Context.xml`(`WEB-INF`의 하위 디렉토리에 있는 모든 그러한 파일)이 있습니다.

### Deploying a Spring ApplicationContext as a Jakarta EE RAR File

Spring `ApplicationContext`를 RAR 파일로 배포하여 컨텍스트와 모든 필수 빈 클래스 및 라이브러리 JAR을 Jakarta EE RAR 배포 단위로 캡슐화할 수 있습니다. 이는 Jakarta EE 서버 기능에 액세스할 수 있는 (Jakarta EE 환경에서만 호스팅되는) 독립 실행형 `ApplicationContext`를 부트스트랩하는 것과 동일합니다. RAR 배포는 HTTP 진입점이 없는 헤드리스 WAR 파일 배포(실제로는 Jakarta EE 환경에서 Spring `ApplicationContext`를 부트스트랩하는 데만 사용되는 WAR 파일)의 시나리오에 대한 더 자연스러운 대안입니다.

RAR 배포는 HTTP 진입점이 필요하지 않고 메시지 엔드포인트 및 예약된 작업으로만 구성된 애플리케이션 컨텍스트에 이상적입니다. 이러한 컨텍스트의 빈은 JTA 트랜잭션 관리자 및 JNDI 바인딩된 JDBC `DataSource` 인스턴스 및 JMS `ConnectionFactory` 인스턴스와 같은 애플리케이션 서버 리소스를 사용할 수 있으며 플랫폼의 JMX 서버에 등록할 수도 있습니다 — 모두 Spring의 표준 트랜잭션 관리 및 JNDI 및 JMX 지원 기능을 통해. 애플리케이션 구성 요소는 Spring의 `TaskExecutor` 추상화를 통해 애플리케이션 서버의 JCA `WorkManager`와도 상호 작용할 수 있습니다.

RAR 배포와 관련된 구성 세부 정보는 [`SpringContextResourceAdapter`](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/jca/context/SpringContextResourceAdapter.html) 클래스의 javadoc을 참조하십시오.

Spring ApplicationContext를 Jakarta EE RAR 파일로 간단히 배포하려면:

1. 모든 애플리케이션 클래스를 RAR 파일(다른 파일 확장자를 가진 표준 JAR 파일)로 패키징합니다.
2. 모든 필수 라이브러리 JAR을 RAR 아카이브의 루트에 추가합니다.
3. `META-INF/ra.xml` 배포 디스크립터([`SpringContextResourceAdapter`에 대한 javadoc](https://docs.spring.io/spring-framework/docs/7.0.5/javadoc-api/org/springframework/jca/context/SpringContextResourceAdapter.html)에 표시된 대로)와 해당 Spring XML 빈 정의 파일(일반적으로 `META-INF/applicationContext.xml`)을 추가합니다.
4. 결과 RAR 파일을 애플리케이션 서버의 배포 디렉토리에 놓습니다.

> **참고**: 이러한 RAR 배포 단위는 일반적으로 자체 포함됩니다. 동일한 애플리케이션의 다른 모듈에도 구성 요소를 외부 세계에 노출하지 않습니다. RAR 기반 `ApplicationContext`와의 상호 작용은 일반적으로 다른 모듈과 공유하는 JMS 대상을 통해 발생합니다. RAR 기반 `ApplicationContext`는 예를 들어 파일 시스템에서 일부 작업을 예약하거나 새 파일에 반응할 수도 있습니다(또는 그와 유사한 것). 외부에서 동기 액세스를 허용해야 하는 경우 동일한 시스템의 다른 애플리케이션 모듈에서 사용할 수 있는 RMI 엔드포인트를 (예를 들어) 내보낼 수 있습니다.
