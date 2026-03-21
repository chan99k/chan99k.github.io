---
title: "Instantiating the Spring Container by Using AnnotationConfigApplicationContext"
description: "이 문서는 Spring 3.0에서 도입된 `AnnotationConfigApplicationContext`를 사용하여 Spring 컨테이너를 인스턴스화하는 다양한 방법을 설명합니다. `AnnotationConfigApplicationContext`는 `@Configuration` 클래스뿐만 아니라 일반 `@Component` 클래스 및 JSR-330 메타데이터로 어노테이션된 클래스도 입력으로 받을 수 있는 유연한 `ApplicationContext` 구현체입니다. 문서는 네 가지 주요 사용 패턴을 다룹니다: (1) 생성자를 통한 단순 구성, (2) `register(Class<?>...)` 메서드를 사용한 프로그래밍 방식 빌드, (3) `scan(String...)` 메서드를 통한 컴포넌트 스캐닝 활성..."
pubDate: "2026-03-10"
tags: ["Resources/translations/Spring/IoC Container"]
contentSource: "ai-assisted"
draft: false
---

# Instantiating the Spring Container by Using AnnotationConfigApplicationContext

> 원문: [Instantiating the Spring Container by Using AnnotationConfigApplicationContext](https://docs.spring.io/spring-framework/reference/core/beans/java/instantiating-container.html)

## 전문 번역

다음 섹션에서는 Spring 3.0에서 도입된 Spring의 `AnnotationConfigApplicationContext`를 문서화합니다. 이 다재다능한 `ApplicationContext` 구현체는 `@Configuration` 클래스뿐만 아니라 일반 `@Component` 클래스 및 JSR-330 메타데이터로 어노테이션된 클래스도 입력으로 받을 수 있습니다.

`@Configuration` 클래스가 입력으로 제공되면, `@Configuration` 클래스 자체가 빈 정의(bean definition)로 등록되고, 클래스 내에서 선언된 모든 `@Bean` 메서드도 빈 정의로 등록됩니다.

`@Component` 및 JSR-330 클래스가 제공되면, 이들은 빈 정의로 등록되며, 필요한 경우 해당 클래스 내에서 `@Autowired` 또는 `@Inject`와 같은 DI 메타데이터가 사용된다고 가정합니다.

### Simple Construction (단순 구성)

`ClassPathXmlApplicationContext`를 인스턴스화할 때 Spring XML 파일이 입력으로 사용되는 것과 거의 동일한 방식으로, `AnnotationConfigApplicationContext`를 인스턴스화할 때 `@Configuration` 클래스를 입력으로 사용할 수 있습니다. 이를 통해 다음 예제에서 보여주는 것처럼 Spring 컨테이너를 완전히 XML 없이 사용할 수 있습니다:

```java
public static void main(String[] args) {
    ApplicationContext ctx = new AnnotationConfigApplicationContext(AppConfig.class);
    MyService myService = ctx.getBean(MyService.class);
    myService.doStuff();
}
```

앞서 언급했듯이, `AnnotationConfigApplicationContext`는 `@Configuration` 클래스와만 작동하는 것으로 제한되지 않습니다. 다음 예제에서 보여주는 것처럼 모든 `@Component` 또는 JSR-330 어노테이션이 달린 클래스를 생성자에 입력으로 제공할 수 있습니다:

```java
public static void main(String[] args) {
    ApplicationContext ctx = new AnnotationConfigApplicationContext(MyServiceImpl.class, Dependency1.class, Dependency2.class);
    MyService myService = ctx.getBean(MyService.class);
    myService.doStuff();
}
```

앞의 예제에서는 `MyServiceImpl`, `Dependency1`, 그리고 `Dependency2`가 `@Autowired`와 같은 Spring 의존성 주입 어노테이션을 사용한다고 가정합니다.

### Building the Container Programmatically by Using `register(Class<?>...)`

인자가 없는 생성자를 사용하여 `AnnotationConfigApplicationContext`를 인스턴스화한 다음 `register()` 메서드를 사용하여 구성할 수 있습니다. 이 접근 방식은 `AnnotationConfigApplicationContext`를 프로그래밍 방식으로 빌드할 때 특히 유용합니다. 다음 예제는 이를 수행하는 방법을 보여줍니다:

```java
public static void main(String[] args) {
    AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
    ctx.register(AppConfig.class, OtherConfig.class);
    ctx.register(AdditionalConfig.class);
    ctx.refresh();
    MyService myService = ctx.getBean(MyService.class);
    myService.doStuff();
}
```

### Enabling Component Scanning with `scan(String...)`

컴포넌트 스캐닝을 활성화하려면 다음과 같이 `@Configuration` 클래스에 어노테이션을 달 수 있습니다:

```java
@Configuration
@ComponentScan(basePackages = "com.acme")  // (1)
public class AppConfig {
    // ...
}
```

(1) 이 어노테이션은 컴포넌트 스캐닝을 활성화합니다.

> **Tip**
>
> 숙련된 Spring 사용자라면 다음 예제에 표시된 Spring의 `context:` 네임스페이스에서 XML 선언과 동등한 것에 익숙할 수 있습니다:
>
> ```xml
> <beans>
>     <context:component-scan base-package="com.acme"/>
> </beans>
> ```

앞의 예제에서 `com.acme` 패키지는 `@Component`로 어노테이션된 클래스를 찾기 위해 스캔되며, 이러한 클래스는 컨테이너 내에서 Spring 빈 정의로 등록됩니다. `AnnotationConfigApplicationContext`는 `scan(String...)` 메서드를 노출하여 다음 예제에서 보여주는 것처럼 동일한 컴포넌트 스캐닝 기능을 허용합니다:

```java
public static void main(String[] args) {
    AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
    ctx.scan("com.acme");
    ctx.refresh();
    MyService myService = ctx.getBean(MyService.class);
}
```

> **Note**
>
> `@Configuration` 클래스는 `@Component`로 메타-어노테이션되어 있으므로 컴포넌트 스캐닝의 후보가 됩니다. 앞의 예제에서 `AppConfig`가 `com.acme` 패키지(또는 그 아래의 모든 패키지) 내에 선언되어 있다고 가정하면, `scan()` 호출 중에 선택됩니다. `refresh()` 시점에 모든 `@Bean` 메서드가 처리되고 컨테이너 내에서 빈 정의로 등록됩니다.

### Support for Web Applications with `AnnotationConfigWebApplicationContext`

`AnnotationConfigApplicationContext`의 `WebApplicationContext` 변형은 `AnnotationConfigWebApplicationContext`로 사용할 수 있습니다. Spring `ContextLoaderListener` 서블릿 리스너, Spring MVC `DispatcherServlet` 등을 구성할 때 이 구현체를 사용할 수 있습니다. 다음 `web.xml` 스니펫은 일반적인 Spring MVC 웹 애플리케이션을 구성합니다(`contextClass` context-param 및 init-param의 사용에 주목하세요):

```xml
<web-app>
    <!-- Configure ContextLoaderListener to use AnnotationConfigWebApplicationContext
        instead of the default XmlWebApplicationContext -->
    <context-param>
        <param-name>contextClass</param-name>
        <param-value>
            org.springframework.web.context.support.AnnotationConfigWebApplicationContext
        </param-value>
    </context-param>

    <!-- Configuration locations must consist of one or more comma- or space-delimited
        fully-qualified @Configuration classes. Fully-qualified packages may also be
        specified for component-scanning -->
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>com.acme.AppConfig</param-value>
    </context-param>

    <!-- Bootstrap the root application context as usual using ContextLoaderListener -->
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <!-- Declare a Spring MVC DispatcherServlet as usual -->
    <servlet>
        <servlet-name>dispatcher</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <!-- Configure DispatcherServlet to use AnnotationConfigWebApplicationContext
            instead of the default XmlWebApplicationContext -->
        <init-param>
            <param-name>contextClass</param-name>
            <param-value>
                org.springframework.web.context.support.AnnotationConfigWebApplicationContext
            </param-value>
        </init-param>
        <!-- Again, config locations must consist of one or more comma- or space-delimited
            and fully-qualified @Configuration classes -->
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>com.acme.web.MvcConfig</param-value>
        </init-param>
    </servlet>

    <!-- map all requests for /app/* to the dispatcher servlet -->
    <servlet-mapping>
        <servlet-name>dispatcher</servlet-name>
        <url-pattern>/app/*</url-pattern>
    </servlet-mapping>
</web-app>
```

> **Note**
>
> 프로그래밍 방식 사용 사례의 경우, `GenericWebApplicationContext`를 `AnnotationConfigWebApplicationContext`의 대안으로 사용할 수 있습니다. 자세한 내용은 `GenericWebApplicationContext` javadoc을 참조하세요.
