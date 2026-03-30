---
title: "Classpath Scanning and Managed Components"
description: "이 문서는 Spring Framework의 클래스패스 스캐닝 기능을 통해 컴포넌트를 자동으로 탐지하고 빈으로 등록하는 방법을 설명합니다. XML 기반의 명시적 빈 정의 대신, `@Component` 및 스테레오타입 애너테이션(`@Repository`, `@Service`, `@Controller`)을 사용하여 빈을 선언할 수 있습니다. `@ComponentScan` 애너테이션을 통해 특정 패키지를 스캔하며, 필터를 사용하여 스캔 대상을 세밀하게 제어할 수 있습니다."
pubDate: "2026-03-10"
tags: ["Resources/translations/Spring/core/IoC Container"]
contentSource: "ai-assisted"
draft: false
---

# Classpath Scanning and Managed Components

> 원문: [Classpath Scanning and Managed Components](https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html)

## 전문 번역

이 장의 대부분의 예제는 Spring 컨테이너 내에서 각 `BeanDefinition`을 생성하는 구성 메타데이터를 지정하기 위해 XML을 사용합니다. 이전 섹션(Annotation-based Container Configuration)에서는 소스 수준 애너테이션을 통해 많은 구성 메타데이터를 제공하는 방법을 시연했습니다. 그러나 그러한 예제에서도 "기본" 빈 정의는 XML 파일에 명시적으로 정의되었으며, 애너테이션은 의존성 주입만을 주도했습니다.

이 섹션에서는 클래스패스를 스캐닝하여 후보 컴포넌트를 암묵적으로 탐지하는 옵션을 설명합니다. 후보 컴포넌트(candidate components)는 필터 기준에 일치하고 컨테이너에 등록된 해당 빈 정의를 가진 클래스입니다. 이는 빈 등록을 수행하기 위해 XML을 사용할 필요성을 제거합니다. 대신, 애너테이션(예: `@Component`), AspectJ 타입 표현식, 또는 사용자 정의 필터 기준을 사용하여 컨테이너에 빈 정의가 등록될 클래스를 선택할 수 있습니다.

> XML 파일을 사용하는 대신 Java를 사용하여 빈을 정의할 수 있습니다. 이러한 기능을 사용하는 방법의 예제를 보려면 `@Configuration`, `@Bean`, `@Import`, `@DependsOn` 애너테이션을 살펴보십시오.

### @Component 및 추가 스테레오타입 애너테이션

`@Repository` 애너테이션은 리포지토리(Data Access Object 또는 DAO라고도 함)의 역할 또는 스테레오타입을 충족하는 모든 클래스의 마커입니다. 이 마커의 용도 중 하나는 Exception Translation에 설명된 대로 예외의 자동 변환입니다.

Spring은 추가 스테레오타입 애너테이션을 제공합니다: `@Component`, `@Service`, `@Controller`. `@Component`는 Spring 관리 컴포넌트를 위한 일반 스테레오타입입니다. `@Repository`, `@Service`, `@Controller`는 더 구체적인 사용 사례(각각 영속성, 서비스, 프레젠테이션 계층)를 위한 `@Component`의 특수화입니다. 따라서 컴포넌트 클래스에 `@Component`로 애너테이션을 달 수 있지만, 대신 `@Repository`, `@Service`, `@Controller`로 애너테이션을 다는 것이 도구에 의한 처리 또는 측면(aspects)과의 연관에 더 적합합니다. 예를 들어, 이러한 스테레오타입 애너테이션은 포인트컷(pointcuts)의 이상적인 타겟을 만듭니다. `@Repository`, `@Service`, `@Controller`는 Spring Framework의 향후 릴리스에서 추가적인 의미를 전달할 수도 있습니다. 따라서 서비스 계층에 `@Component`와 `@Service` 중 선택해야 한다면, `@Service`가 명백히 더 나은 선택입니다. 마찬가지로, 앞서 언급한 대로, `@Repository`는 영속성 계층에서 자동 예외 변환을 위한 마커로 이미 지원되고 있습니다.

### 메타 애너테이션 및 조합 애너테이션 사용하기

Spring이 제공하는 많은 애너테이션은 자신의 코드에서 메타 애너테이션으로 사용할 수 있습니다. 메타 애너테이션(meta-annotation)은 다른 애너테이션에 적용될 수 있는 애너테이션입니다. 예를 들어, 앞서 언급한 `@Service` 애너테이션은 다음 예제와 같이 `@Component`로 메타 애너테이션이 달려 있습니다:

**Java**

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component
public @interface Service {

	// ...
}
```

> `@Component` 메타 애너테이션은 `@Service`가 `@Component`와 동일한 방식으로 처리되도록 합니다.

메타 애너테이션을 결합하여 "조합 애너테이션(composed annotations)"을 만들 수도 있습니다. 예를 들어, Spring MVC의 `@RestController` 애너테이션은 `@Controller`와 `@ResponseBody`로 구성되어 있습니다.

또한, 조합 애너테이션은 선택적으로 메타 애너테이션의 속성을 재선언하여 사용자 정의를 허용할 수 있습니다. 이는 메타 애너테이션 속성의 하위 집합만 노출하려는 경우에 특히 유용할 수 있습니다. 예를 들어, Spring의 `@SessionScope` 애너테이션은 스코프 이름을 `session`으로 하드 코딩하지만 여전히 `proxyMode`의 사용자 정의를 허용합니다. 다음 목록은 `@SessionScope` 애너테이션의 정의를 보여줍니다:

**Java**

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Scope(WebApplicationContext.SCOPE_SESSION)
public @interface SessionScope {

	/**
	 * Alias for {@link Scope#proxyMode}.
	 * <p>Defaults to {@link ScopedProxyMode#TARGET_CLASS}.
	 */
	@AliasFor(annotation = Scope.class)
	ScopedProxyMode proxyMode() default ScopedProxyMode.TARGET_CLASS;

}
```

그런 다음 다음과 같이 `proxyMode`를 선언하지 않고 `@SessionScope`를 사용할 수 있습니다:

**Java**

```java
@Service
@SessionScope
public class SessionScopedService {
	// ...
}
```

다음 예제와 같이 `proxyMode`의 값을 재정의할 수도 있습니다:

**Java**

```java
@Service
@SessionScope(proxyMode = ScopedProxyMode.INTERFACES)
public class SessionScopedUserService implements UserService {
	// ...
}
```

자세한 내용은 [Spring Annotation Programming Model](https://github.com/spring-projects/spring-framework/wiki/Spring-Annotation-Programming-Model) 위키 페이지를 참조하십시오.

### 클래스 자동 탐지 및 빈 정의 등록

Spring은 스테레오타입이 적용된 클래스를 자동으로 탐지하고 해당 `BeanDefinition` 인스턴스를 `ApplicationContext`에 등록할 수 있습니다. 예를 들어, 다음 두 클래스는 이러한 자동 탐지 대상이 됩니다:

**Java**

```java
@Service
public class SimpleMovieLister {

	private final MovieFinder movieFinder;

	public SimpleMovieLister(MovieFinder movieFinder) {
		this.movieFinder = movieFinder;
	}
}
```

**Java**

```java
@Repository
public class JpaMovieFinder implements MovieFinder {
	// implementation elided for clarity
}
```

이러한 클래스를 자동 탐지하고 해당 빈을 등록하려면, `@ComponentScan`을 `@Configuration` 클래스에 추가해야 하며, 여기서 `basePackages` 속성은 두 클래스의 공통 부모 패키지로 구성됩니다. 또는 쉼표, 세미콜론, 또는 공백으로 구분된 목록을 지정하여 각 클래스의 부모 패키지를 포함할 수 있습니다.

**Java**

```java
@Configuration
@ComponentScan(basePackages = "org.example")
public class AppConfig  {
	// ...
}
```

> 간결성을 위해, 앞의 예제는 애너테이션의 암묵적 `value` 속성을 사용할 수 있었습니다: `@ComponentScan("org.example")`

다음 예제는 XML 구성을 보여줍니다:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:context="http://www.springframework.org/schema/context"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
		https://www.springframework.org/schema/beans/spring-beans.xsd
		http://www.springframework.org/schema/context
		https://www.springframework.org/schema/context/spring-context.xsd">

	<context:component-scan base-package="org.example"/>

</beans>
```

> `<context:component-scan>`의 사용은 암묵적으로 `<context:annotation-config>`의 기능을 활성화합니다. `<context:component-scan>`을 사용할 때는 일반적으로 `<context:annotation-config>` 요소를 포함할 필요가 없습니다.

> 클래스패스 패키지의 스캐닝은 클래스패스에 해당 디렉토리 항목이 있어야 합니다. Ant로 JAR을 빌드할 때, JAR 태스크의 files-only 스위치를 활성화하지 않도록 주의하십시오. 또한 클래스패스 디렉토리는 일부 환경에서 보안 정책에 따라 노출되지 않을 수 있습니다. 예를 들어, JDK 1.7.0_45 이상의 독립 실행형 앱(매니페스트에 'Trusted-Library' 설정이 필요함 - [stackoverflow.com/questions/19394570/java-jre-7u45-breaks-classloader-getresources](https://stackoverflow.com/questions/19394570/java-jre-7u45-breaks-classloader-getresources) 참조).

> 모듈 경로(Java Module System)에서 Spring의 클래스패스 스캐닝은 일반적으로 예상대로 작동합니다. 그러나 컴포넌트 클래스가 `module-info` 디스크립터에서 내보내기(exported)되었는지 확인하십시오. Spring이 클래스의 비공개 멤버를 호출할 것으로 예상한다면, 그것들이 'opened'되었는지 확인하십시오(즉, `module-info` 디스크립터에서 `exports` 선언 대신 `opens` 선언을 사용).

또한, `<context:component-scan>` 요소를 사용하면 `AutowiredAnnotationBeanPostProcessor`와 `CommonAnnotationBeanPostProcessor`가 모두 암묵적으로 포함됩니다. 이는 두 컴포넌트가 자동 탐지되고 함께 연결됨을 의미합니다 - XML에서 제공되는 빈 구성 메타데이터 없이 모두 이루어집니다.

> `annotation-config` 속성을 `false` 값으로 포함하여 `AutowiredAnnotationBeanPostProcessor` 및 `CommonAnnotationBeanPostProcessor`의 등록을 비활성화할 수 있습니다.

#### 속성 플레이스홀더 및 Ant 스타일 패턴

`@ComponentScan`의 `basePackages`와 `value` 속성은 `Environment`에 대해 해석되는 `${…}` 속성 플레이스홀더뿐만 아니라 `"org.example.**"`와 같은 Ant 스타일 패키지 패턴을 지원합니다.

또한 여러 패키지 또는 패턴을 개별적으로 또는 단일 `String` 내에서 지정할 수 있습니다. 예를 들어 `{"org.example.config", "org.example.service.**"}` 또는 `"org.example.config, org.example.service.**"`.

다음 예제는 `@ComponentScan`의 암묵적 `value` 속성에 대한 `app.scan.packages` 속성 플레이스홀더를 지정합니다.

**Java**

```java
@Configuration
@ComponentScan("${app.scan.packages}")
public class AppConfig {
	// ...
}
```

> `Environment`에 대해 해석될 `app.scan.packages` 속성 플레이스홀더

다음 목록은 `app.scan.packages` 속성을 정의하는 properties 파일을 나타냅니다. 앞의 예제에서 이 properties 파일은 `Environment`에 등록되었다고 가정합니다. 예를 들어 `@PropertySource` 또는 유사한 메커니즘을 통해.

```properties
app.scan.packages=org.example.config, org.example.service.**
```

#### 필터를 사용하여 스캐닝 사용자 정의

기본적으로, `@Component`, `@Repository`, `@Service`, `@Controller`, `@Configuration`으로 애너테이션이 달리거나 자체가 `@Component`로 애너테이션이 달린 커스텀 애너테이션만이 탐지된 후보 컴포넌트입니다. 그러나 커스텀 필터를 적용하여 이 동작을 수정하고 확장할 수 있습니다. `@ComponentScan` 애너테이션의 `includeFilters` 또는 `excludeFilters` 속성(또는 XML 구성에서 `<context:component-scan>` 요소의 `<context:include-filter />` 또는 `<context:exclude-filter />` 자식 요소)으로 추가하십시오. 각 필터 요소는 `type`과 `expression` 속성이 필요합니다. 다음 표는 필터링 옵션을 설명합니다:

**Table 1. Filter Types**

| Filter Type | Example Expression | Description |
|-------------|-------------------|-------------|
| annotation (default) | `org.example.SomeAnnotation` | 타겟 컴포넌트의 타입 레벨에서 present 또는 meta-present인 애너테이션. |
| assignable | `org.example.SomeClass` | 타겟 컴포넌트가 할당 가능한(확장하거나 구현하는) 클래스(또는 인터페이스). |
| aspectj | `org.example..*Service+` | 타겟 컴포넌트가 매치되어야 하는 AspectJ 타입 표현식. |
| regex | `org\.example\.Default.*` | 타겟 컴포넌트의 클래스 이름이 매치되어야 하는 정규 표현식. |
| custom | `org.example.MyTypeFilter` | `org.springframework.core.type.TypeFilter` 인터페이스의 커스텀 구현. |

다음 예제는 모든 `@Repository` 애너테이션을 제외하고 대신 "Stub" 리포지토리를 포함하는 `@ComponentScan` 구성을 보여줍니다:

**Java**

```java
@Configuration
@ComponentScan(basePackages = "org.example",
		includeFilters = @Filter(type = FilterType.REGEX, pattern = ".*Stub.*Repository"),
		excludeFilters = @Filter(Repository.class))
public class AppConfig {
	// ...
}
```

다음 목록은 동등한 XML을 보여줍니다:

```xml
<beans>
	<context:component-scan base-package="org.example">
		<context:include-filter type="regex"
				expression=".*Stub.*Repository"/>
		<context:exclude-filter type="annotation"
				expression="org.springframework.stereotype.Repository"/>
	</context:component-scan>
</beans>
```

> 애너테이션에서 `useDefaultFilters=false`를 설정하거나 `<component-scan/>` 요소의 속성으로 `use-default-filters="false"`를 제공하여 기본 필터를 비활성화할 수도 있습니다. 이는 `@Component`, `@Repository`, `@Service`, `@Controller`, `@RestController`, `@Configuration`으로 애너테이션되거나 메타 애너테이션된 클래스의 자동 탐지를 효과적으로 비활성화합니다.

### 자동 탐지된 컴포넌트 이름 지정

스캐닝 프로세스의 일부로 컴포넌트가 자동 탐지되면, 해당 빈 이름은 스캐너에 알려진 `BeanNameGenerator` 전략에 의해 생성됩니다.

기본적으로 `AnnotationBeanNameGenerator`가 사용됩니다. Spring 스테레오타입 애너테이션의 경우, 애너테이션의 `value` 속성을 통해 이름을 제공하면 해당 이름이 해당 빈 정의의 이름으로 사용됩니다. 이 규칙은 Spring 스테레오타입 애너테이션 대신 `@jakarta.inject.Named` 애너테이션을 사용할 때도 적용됩니다.

Spring Framework 6.1부터, 빈 이름을 지정하는 데 사용되는 애너테이션 속성의 이름이 더 이상 `value`일 필요가 없습니다. 커스텀 스테레오타입 애너테이션은 다른 이름(예: `name`)을 가진 속성을 선언하고 해당 속성에 `@AliasFor(annotation = Component.class, attribute = "value")`로 애너테이션을 달 수 있습니다. 구체적인 예제는 `ControllerAdvice#name()`의 소스 코드 선언을 참조하십시오.

Spring Framework 6.1부터, 규칙 기반 스테레오타입 이름 지원은 더 이상 사용되지 않으며(deprecated) 프레임워크의 향후 버전에서 제거될 예정입니다. 따라서 커스텀 스테레오타입 애너테이션은 `@Component`의 `value` 속성에 대한 명시적 별칭을 선언하기 위해 `@AliasFor`를 사용해야 합니다. 구체적인 예제는 `Repository#value()` 및 `ControllerAdvice#name()`의 소스 코드 선언을 참조하십시오.

명시적 빈 이름을 이러한 애너테이션에서 파생할 수 없거나 다른 탐지된 컴포넌트(예: 커스텀 필터에 의해 발견된 것)의 경우, 기본 빈 이름 생성기는 대문자가 아닌 정규화되지 않은 클래스 이름을 반환합니다. 예를 들어, 다음 컴포넌트 클래스가 탐지된 경우, 이름은 `myMovieLister`와 `movieFinderImpl`이 됩니다.

**Java**

```java
@Service("myMovieLister")
public class SimpleMovieLister {
	// ...
}
```

**Java**

```java
@Repository
public class MovieFinderImpl implements MovieFinder {
	// ...
}
```

기본 빈 이름 지정 전략에 의존하고 싶지 않다면, 커스텀 빈 이름 지정 전략을 제공할 수 있습니다. 먼저 `BeanNameGenerator` 인터페이스를 구현하고 기본 no-arg 생성자를 포함해야 합니다. 그런 다음 다음 예제 애너테이션 및 빈 정의와 같이 스캐너를 구성할 때 정규화된 클래스 이름을 제공하십시오.

> 여러 자동 탐지된 컴포넌트가 동일한 정규화되지 않은 클래스 이름을 가져서(즉, 동일한 이름을 가진 클래스가 다른 패키지에 있는 경우) 이름 충돌이 발생하는 경우, 생성된 빈 이름의 정규화된 클래스 이름을 기본값으로 하는 `BeanNameGenerator`를 구성해야 할 수 있습니다. `org.springframework.context.annotation` 패키지에 있는 `FullyQualifiedAnnotationBeanNameGenerator`를 이러한 목적으로 사용할 수 있습니다.

**Java**

```java
@Configuration
@ComponentScan(basePackages = "org.example", nameGenerator = MyNameGenerator.class)
public class AppConfig {
	// ...
}
```

```xml
<beans>
	<context:component-scan base-package="org.example"
		name-generator="org.example.MyNameGenerator" />
</beans>
```

일반적인 규칙으로, 다른 컴포넌트가 명시적으로 참조할 수 있는 경우 애너테이션으로 이름을 지정하는 것을 고려하십시오. 반면에, 자동 생성된 이름은 컨테이너가 와이어링을 담당할 때마다 적절합니다.

### 자동 탐지된 컴포넌트에 스코프 제공

일반적으로 Spring 관리 컴포넌트와 마찬가지로, 자동 탐지된 컴포넌트의 기본 및 가장 일반적인 스코프는 `singleton`입니다. 그러나 때로는 `@Scope` 애너테이션으로 지정할 수 있는 다른 스코프가 필요합니다. 다음 예제와 같이 애너테이션 내에 스코프 이름을 제공할 수 있습니다:

**Java**

```java
@Scope("prototype")
@Repository
public class MovieFinderImpl implements MovieFinder {
	// ...
}
```

> `@Scope` 애너테이션은 구체적인 빈 클래스(애너테이션된 컴포넌트의 경우) 또는 팩토리 메서드(`@Bean` 메서드의 경우)에서만 인트로스펙트됩니다. XML 빈 정의와 대조적으로, 빈 정의 상속의 개념은 없으며 클래스 레벨의 상속 계층은 메타데이터 목적과 무관합니다.

Spring 컨텍스트의 "request" 또는 "session"과 같은 웹 전용 스코프에 대한 자세한 내용은 Request, Session, Application, and WebSocket Scopes를 참조하십시오. 해당 스코프에 대한 사전 빌드된 애너테이션과 마찬가지로, Spring의 메타 애너테이션 접근 방식을 사용하여 자신의 스코핑 애너테이션을 구성할 수도 있습니다. 예를 들어, `@Scope("prototype")`로 메타 애너테이션된 커스텀 애너테이션, 또한 커스텀 스코프 프록시 모드를 선언할 수도 있습니다.

애너테이션 기반 접근 방식에 의존하지 않고 스코프 해석을 위한 커스텀 전략을 제공하려면, `ScopeMetadataResolver` 인터페이스를 구현할 수 있습니다. 기본 no-arg 생성자를 포함해야 합니다. 그런 다음 다음 애너테이션 및 빈 정의 예제와 같이 스캐너를 구성할 때 정규화된 클래스 이름을 제공할 수 있습니다:

**Java**

```java
@Configuration
@ComponentScan(basePackages = "org.example", scopeResolver = MyScopeResolver.class)
public class AppConfig {
	// ...
}
```

```xml
<beans>
	<context:component-scan base-package="org.example" scope-resolver="org.example.MyScopeResolver"/>
</beans>
```

특정 비싱글톤(non-singleton) 스코프를 사용할 때, 스코프가 지정된 객체에 대한 프록시를 생성해야 할 수 있습니다. 그 이유는 Scoped Beans as Dependencies에 설명되어 있습니다. 이 목적을 위해, `component-scan` 요소에서 `scoped-proxy` 속성을 사용할 수 있습니다. 가능한 세 가지 값은 `no`, `interfaces`, `targetClass`입니다. 예를 들어, 다음 구성은 표준 JDK 동적 프록시를 생성합니다:

**Java**

```java
@Configuration
@ComponentScan(basePackages = "org.example", scopedProxy = ScopedProxyMode.INTERFACES)
public class AppConfig {
	// ...
}
```

```xml
<beans>
	<context:component-scan base-package="org.example" scoped-proxy="interfaces"/>
</beans>
```

### 애너테이션으로 한정자 메타데이터 제공

`@Qualifier` 애너테이션은 Fine-tuning Annotation-based Autowiring with Qualifiers에서 논의되었습니다. 해당 섹션의 예제는 자동 와이어 후보를 해석할 때 세밀한 제어를 제공하기 위해 `@Qualifier` 애너테이션과 커스텀 한정자 애너테이션을 사용하는 것을 시연했습니다. 해당 예제는 XML 빈 정의를 기반으로 했기 때문에, 한정자 메타데이터는 XML의 `bean` 요소의 `qualifier` 또는 `meta` 자식 요소를 사용하여 후보 빈 정의에 제공되었습니다. 컴포넌트의 자동 탐지를 위해 클래스패스 스캐닝에 의존할 때, 후보 클래스의 타입 레벨 애너테이션으로 한정자 메타데이터를 제공할 수 있습니다. 다음 세 가지 예제는 이 기법을 시연합니다:

**Java**

```java
@Component
@Qualifier("Action")
public class ActionMovieCatalog implements MovieCatalog {
	// ...
}
```

**Java**

```java
@Component
@Genre("Action")
public class ActionMovieCatalog implements MovieCatalog {
	// ...
}
```

**Java**

```java
@Component
@Offline
public class CachingMovieCatalog implements MovieCatalog {
	// ...
}
```

> 대부분의 애너테이션 기반 대안과 마찬가지로, 애너테이션 메타데이터는 클래스 정의 자체에 바인딩되는 반면, XML의 사용은 동일한 타입의 여러 빈이 한정자 메타데이터의 변형을 제공할 수 있다는 점을 명심하십시오. 왜냐하면 해당 메타데이터는 클래스당이 아니라 인스턴스당 제공되기 때문입니다.

### 컴포넌트 내에서 빈 메타데이터 정의

Spring 컴포넌트는 컨테이너에 빈 정의 메타데이터를 기여할 수도 있습니다. `@Configuration` 애너테이션된 클래스 내에서 빈 메타데이터를 정의하는 데 사용되는 것과 동일한 `@Bean` 애너테이션으로 이를 수행할 수 있습니다. 다음 예제는 이를 수행하는 방법을 보여줍니다:

**Java**

```java
@Component
public class FactoryMethodComponent {

	@Bean
	@Qualifier("public")
	public TestBean publicInstance() {
		return new TestBean("publicInstance");
	}

	public void doWork() {
		// Component method implementation omitted
	}
}
```

앞의 클래스는 `doWork()` 메서드에 애플리케이션 특정 코드를 가진 Spring 컴포넌트입니다. 그러나 또한 메서드 `publicInstance()`를 참조하는 팩토리 메서드를 가진 빈 정의를 기여합니다. `@Bean` 애너테이션은 팩토리 메서드와 `@Qualifier` 애너테이션을 통한 한정자 값과 같은 다른 빈 정의 속성을 식별합니다. 지정할 수 있는 다른 메서드 레벨 애너테이션은 `@Scope`, `@Lazy`, 커스텀 한정자 애너테이션입니다.

컴포넌트 초기화의 역할 외에도, `@Lazy` 애너테이션을 `@Autowired` 또는 `@Inject`로 표시된 주입 지점에 배치할 수도 있습니다. 이 컨텍스트에서, 이는 지연 해결 프록시의 주입으로 이어집니다. 그러나 그러한 프록시 접근 방식은 다소 제한적입니다. 정교한 지연 상호 작용을 위해, 특히 선택적 종속성과 결합된 경우, 대신 `ObjectProvider<MyTargetBean>`를 권장합니다.

앞서 논의한 바와 같이, 자동 와이어된 필드 및 메서드가 지원되며, `@Bean` 메서드의 자동 와이어링에 대한 추가 지원이 있습니다. 다음 예제는 이를 수행하는 방법을 보여줍니다:

**Java**

```java
@Component
public class FactoryMethodComponent {

	private static int i;

	@Bean
	@Qualifier("public")
	public TestBean publicInstance() {
		return new TestBean("publicInstance");
	}

	// use of a custom qualifier and autowiring of method parameters
	@Bean
	protected TestBean protectedInstance(
			@Qualifier("public") TestBean spouse,
			@Value("#{privateInstance.age}") String country) {
		TestBean tb = new TestBean("protectedInstance", 1);
		tb.setSpouse(spouse);
		tb.setCountry(country);
		return tb;
	}

	@Bean
	private TestBean privateInstance() {
		return new TestBean("privateInstance", i++);
	}

	@Bean
	@RequestScope
	public TestBean requestScopedInstance() {
		return new TestBean("requestScopedInstance", 3);
	}
}
```

이 예제는 `String` 메서드 매개변수 `country`를 `privateInstance`라는 이름의 다른 빈의 `age` 속성 값에 자동 와이어합니다. Spring Expression Language 요소는 `#{ <expression> }` 표기법을 통해 속성 값을 정의합니다. `@Value` 애너테이션의 경우, 표현식 리졸버는 표현식 텍스트를 해석할 때 빈 이름을 찾도록 사전 구성됩니다.

Spring Framework 4.3부터, 현재 빈의 생성을 트리거하는 요청 주입 지점에 액세스하기 위해 타입이 `InjectionPoint`(또는 그 더 구체적인 서브클래스: `DependencyDescriptor`)인 팩토리 메서드 매개변수를 선언할 수도 있습니다. 이는 기존 인스턴스의 주입이 아니라 빈 인스턴스의 실제 생성에만 적용됩니다. 결과적으로, 이 기능은 프로토타입 스코프의 빈에 가장 적합합니다. 다른 스코프의 경우, 팩토리 메서드는 주어진 스코프에서 새 빈 인스턴스의 생성을 트리거한 주입 지점만 보게 됩니다(예를 들어, 지연 싱글톤 빈의 생성을 트리거한 종속성). 이러한 시나리오에서는 제공된 주입 지점 메타데이터를 의미적으로 주의하여 사용할 수 있습니다. 다음 예제는 `InjectionPoint`를 사용하는 방법을 보여줍니다:

**Java**

```java
@Component
public class FactoryMethodComponent {

	@Bean @Scope("prototype")
	public TestBean prototypeInstance(InjectionPoint injectionPoint) {
		return new TestBean("prototypeInstance for " + injectionPoint.getMember());
	}
}
```

일반 Spring 컴포넌트의 `@Bean` 메서드는 Spring `@Configuration` 클래스 내부의 대응 메서드와 다르게 처리됩니다. 차이점은 `@Component` 클래스는 메서드 및 필드의 호출을 가로채기 위해 CGLIB로 향상되지 않는다는 것입니다. CGLIB 프록싱은 `@Configuration` 클래스의 `@Bean` 메서드 내에서 메서드 또는 필드를 호출하여 협업 객체에 대한 빈 메타데이터 참조를 생성하는 수단입니다. 이러한 메서드는 일반 Java 의미론으로 호출되지 않고, 오히려 컨테이너를 통해 진행되어 `@Bean` 메서드에 대한 프로그래매틱 호출을 통해 다른 빈을 참조할 때에도 Spring 빈의 일반적인 라이프사이클 관리 및 프록싱을 제공합니다. 대조적으로, 일반 `@Component` 클래스 내의 `@Bean` 메서드에서 메서드 또는 필드를 호출하는 것은 특별한 CGLIB 처리나 기타 제약이 적용되지 않는 표준 Java 의미론을 갖습니다.

`@Bean` 메서드를 `static`으로 선언할 수 있으며, 이는 포함하는 구성 클래스를 인스턴스로 생성하지 않고 호출될 수 있게 합니다. 이는 포스트 프로세서 빈(예: `BeanFactoryPostProcessor` 또는 `BeanPostProcessor` 타입)을 정의할 때 특히 의미가 있습니다. 왜냐하면 이러한 빈은 컨테이너 라이프사이클 초기에 초기화되며 그 시점에서 구성의 다른 부분을 트리거하는 것을 피해야 하기 때문입니다.

정적 `@Bean` 메서드에 대한 호출은 이 섹션 앞부분에서 설명한 대로 `@Configuration` 클래스 내에서도 기술적 제한으로 인해 컨테이너에 의해 가로채지지 않습니다: CGLIB 서브클래싱은 비정적 메서드만 재정의할 수 있습니다. 결과적으로, 다른 `@Bean` 메서드에 대한 직접 호출은 표준 Java 의미론을 가지며, 팩토리 메서드 자체에서 직접 독립 인스턴스가 반환됩니다.

`@Bean` 메서드의 Java 언어 가시성은 Spring 컨테이너의 결과 빈 정의에 즉각적인 영향을 미치지 않습니다. 비`@Configuration` 클래스와 어디에서나 정적 메서드에 대해 자유롭게 팩토리 메서드를 선언할 수 있습니다. 그러나 `@Configuration` 클래스의 일반 `@Bean` 메서드는 재정의 가능해야 합니다. 즉, `private` 또는 `final`로 선언되어서는 안 됩니다.

`@Bean` 메서드는 또한 주어진 컴포넌트 또는 구성 클래스의 기본 클래스뿐만 아니라 컴포넌트 또는 구성 클래스에 의해 구현된 인터페이스에 선언된 Java 기본 메서드에서도 발견됩니다. 이는 복잡한 구성 배열을 구성하는 데 많은 유연성을 허용하며, Java 기본 메서드를 통한 다중 상속도 가능합니다.

마지막으로, 단일 클래스는 런타임에 사용 가능한 종속성에 따라 사용할 여러 팩토리 메서드의 배열로 동일한 빈에 대해 여러 `@Bean` 메서드를 보유할 수 있습니다. 이는 다른 구성 시나리오에서 "가장 욕심 많은(greediest)" 생성자 또는 팩토리 메서드를 선택하는 것과 동일한 알고리즘입니다: 충족 가능한 종속성의 수가 가장 많은 변형이 구성 시점에 선택되며, 이는 컨테이너가 여러 `@Autowired` 생성자 중에서 선택하는 방법과 유사합니다.

### @PostConstruct 및 @PreDestroy 사용

(문서 끝 - 다음 섹션으로 넘어감)

### JSR-330 표준 애너테이션 사용

(문서 끝 - 다음 섹션으로 넘어감)
