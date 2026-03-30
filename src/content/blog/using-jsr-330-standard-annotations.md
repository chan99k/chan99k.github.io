---
title: "Using JSR-330 Standard Annotations"
description: "이 문서는 Spring Framework에서 JSR-330 표준 의존성 주입 애노테이션을 사용하는 방법을 설명합니다. Spring은 `jakarta.inject` 패키지의 표준 애노테이션을 지원하며, 이를 Spring의 기본 애노테이션 대안으로 사용할 수 있습니다. 주요 내용으로 `@Inject`와 `@Named` 애노테이션의 사용법, `@Component`의 표준 대안으로서 `@Named`의 활용, 그리고 JSR-330 표준 애노테이션의 제한사항을 다룹니다."
pubDate: "2026-03-10"
tags: ["Resources/translations/Spring/core/IoC Container"]
contentSource: "ai-assisted"
draft: false
---

# Using JSR-330 Standard Annotations

> 원문: [Using JSR-330 Standard Annotations](https://docs.spring.io/spring-framework/reference/core/beans/standard-annotations.html)

## 전문 번역

Spring은 `jakarta.inject` 패키지에서 사용 가능한 JSR-330 표준 의존성 주입(Dependency Injection) 애노테이션을 지원합니다. 이러한 애노테이션은 Spring 애노테이션의 대안으로 선택적으로 사용할 수 있습니다.

이를 사용하려면 classpath에 관련 jar 파일이 필요합니다. 예를 들어, `jakarta.inject` 아티팩트는 표준 Maven 저장소(https://repo.maven.apache.org/maven2/jakarta/inject/jakarta.inject-api/2.0.0/)에서 사용할 수 있습니다.

**Note**
Maven을 사용하는 경우, `pom.xml` 파일에 다음 의존성을 추가할 수 있습니다.

```xml
<dependency>
    <groupId>jakarta.inject</groupId>
    <artifactId>jakarta.inject-api</artifactId>
    <version>2.0.0</version>
</dependency>
```

### Dependency Injection with `@Inject` and `@Named`

의존성 주입을 위해 `@Autowired`를 사용하는 대신, 다음과 같이 `@jakarta.inject.Inject`를 선택적으로 사용할 수 있습니다.

**Java 예제:**

```java
import jakarta.inject.Inject;

public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Inject
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    public void listMovies() {
        this.movieFinder.findMovies(...);
        // ...
    }
}
```

`@Autowired`와 마찬가지로, `@Inject`는 필드 레벨(field level), 메서드 레벨(method level), 생성자 인자 레벨(constructor-argument level)에서 사용할 수 있습니다.

또한, Spring의 `ObjectProvider` 메커니즘의 대안으로, 주입 지점(injection point)을 `jakarta.inject.Provider`로 선언할 수 있습니다. 이를 통해 더 짧은 스코프의 빈에 대한 온디맨드(on-demand) 접근이나 `Provider.get()` 호출을 통한 다른 빈에 대한 지연 접근(lazy access)이 가능합니다. 다음 예제는 앞선 예제의 변형입니다.

**Java 예제:**

```java
import jakarta.inject.Inject;
import jakarta.inject.Provider;

public class SimpleMovieLister {

    private Provider<MovieFinder> movieFinder;

    @Inject
    public void setMovieFinder(Provider<MovieFinder> movieFinder) {
        this.movieFinder = movieFinder;
    }

    public void listMovies() {
        this.movieFinder.get().findMovies(...);
        // ...
    }
}
```

주입되어야 할 의존성에 대해 qualified name을 사용하고자 한다면, 다음 예제와 같이 Spring의 `@Qualifier` 지원에 대한 대안으로 `@Named` 애노테이션을 선택적으로 사용할 수 있습니다.

**Java 예제:**

```java
import jakarta.inject.Inject;
import jakarta.inject.Named;

public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Inject
    public void setMovieFinder(@Named("main") MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    // ...
}
```

`@Autowired`와 마찬가지로, `@Inject`는 `java.util.Optional` 또는 `@Nullable`과 함께 사용할 수 있습니다. `@Inject`에는 `required` 속성이 없기 때문에 여기서 이것이 더욱 적용 가능합니다. 다음 예제들은 `@Inject`를 `Optional`, `@Nullable`, 그리고 Kotlin의 내장 nullable 타입 지원과 함께 사용하는 방법을 보여줍니다.

**Java 예제 (Optional 사용):**

```java
import jakarta.inject.Inject;
import java.util.Optional;

public class SimpleMovieLister {

    @Inject
    public void setMovieFinder(Optional<MovieFinder> movieFinder) {
        // ...
    }
}
```

**Java 예제 (@Nullable 사용):**

```java
import jakarta.inject.Inject;
import org.jspecify.annotations.Nullable;

public class SimpleMovieLister {

    @Inject
    public void setMovieFinder(@Nullable MovieFinder movieFinder) {
        // ...
    }
}
```

### `@Named`: Standard Equivalent to the `@Component` Annotation

`@Component` 또는 다른 Spring 스테레오타입 애노테이션 대신, 다음 예제와 같이 `@jakarta.inject.Named`를 선택적으로 사용할 수 있습니다.

**Java 예제:**

```java
import jakarta.inject.Inject;
import jakarta.inject.Named;

@Named("movieListener")
public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Inject
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    // ...
}
```

컴포넌트의 명시적인 이름을 지정하지 않고 `@Component` 또는 다른 Spring 스테레오타입 애노테이션을 사용하는 것은 매우 일반적이며, `@Named`도 다음 예제와 같이 유사한 방식으로 사용할 수 있습니다.

**Java 예제:**

```java
import jakarta.inject.Inject;
import jakarta.inject.Named;

@Named
public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Inject
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    // ...
}
```

`@Named`를 사용할 때, Spring 애노테이션을 사용할 때와 정확히 동일한 방식으로 컴포넌트 스캐닝을 사용할 수 있습니다. 다음 예제를 참조하십시오.

**Java 예제:**

```java
@Configuration
@ComponentScan(basePackages = "org.example")
public class AppConfig {
    // ...
}
```

**Note**
`@Component`와 달리, JSR-330 `@Named` 애노테이션은 조합 가능하지 않습니다(not composable). 사용자 정의 컴포넌트 애노테이션을 구축하려면 Spring의 스테레오타입 모델을 사용해야 합니다.

**Tip**
레거시 시스템에서 여전히 컴포넌트에 대해 `@javax.inject.Named` 또는 `@javax.annotation.ManagedBean`을 사용하는 경우(`javax` 패키지 네임스페이스에 주목), 다음 예제와 같이 해당 애노테이션 타입을 포함하도록 컴포넌트 스캐닝을 명시적으로 구성할 수 있습니다.

**Java 예제:**

```java
@Configuration
@ComponentScan(
    basePackages = "org.example",
    includeFilters = @Filter({
        javax.inject.Named.class,
        javax.annotation.ManagedBean.class
    })
)
public class AppConfig {
    // ...
}
```

또한, `@javax.inject.Named` 및 `@javax.annotation.ManagedBean`의 `value` 속성을 컴포넌트 이름으로 사용하려면, `AnnotationBeanNameGenerator`의 `isStereotypeWithNameValue(…)` 메서드를 재정의하여 `javax.annotation.ManagedBean` 및 `javax.inject.Named`에 대한 명시적인 지원을 추가하고, `@ComponentScan`의 `nameGenerator` 속성을 통해 사용자 정의 `AnnotationBeanNameGenerator`를 등록해야 합니다.

### Limitations of JSR-330 Standard Annotations

JSR-330 표준 애노테이션으로 작업할 때, 다음 표에서 보여주는 것처럼 일부 중요한 기능을 사용할 수 없다는 것을 알아야 합니다.

**Table 1. Spring component model versus JSR-330 variants**

| Spring | JSR-330 | JSR-330 restrictions / comments |
|--------|---------|----------------------------------|
| `@Autowired` | `@Inject` | `@Inject`에는 `required` 속성이 없습니다. 대신 Java의 `Optional`과 함께 사용할 수 있습니다. |
| `@Component` | `@Named` | JSR-330은 조합 가능한 모델을 제공하지 않으며, 단지 이름이 지정된 컴포넌트를 식별하는 방법만 제공합니다. |
| `@Scope("singleton")` | `@Singleton` | JSR-330 기본 스코프는 Spring의 `prototype`과 유사합니다. 그러나 Spring의 일반적인 기본값과 일관성을 유지하기 위해, Spring 컨테이너에 선언된 JSR-330 빈은 기본적으로 `singleton`입니다. `singleton` 외의 스코프를 사용하려면 Spring의 `@Scope` 애노테이션을 사용해야 합니다. `jakarta.inject`는 `jakarta.inject.Scope` 애노테이션도 제공하지만, 이것은 사용자 정의 애노테이션을 생성하는 데만 사용됩니다. |
| `@Qualifier` | `@Qualifier` / `@Named` | `jakarta.inject.Qualifier`는 사용자 정의 한정자(custom qualifiers)를 구축하기 위한 메타 애노테이션일 뿐입니다. 구체적인 `String` 한정자(Spring의 값이 있는 `@Qualifier`와 같은)는 `jakarta.inject.Named`를 통해 연결될 수 있습니다. |
| `@Value` | - | 동등한 것이 없음 |
| `@Lazy` | - | 동등한 것이 없음 |
| `ObjectFactory` | `Provider` | `jakarta.inject.Provider`는 Spring의 `ObjectFactory`에 대한 직접적인 대안이며, 단지 더 짧은 `get()` 메서드 이름을 가집니다. 이것은 Spring의 `@Autowired`와 조합하여 사용하거나 애노테이션이 없는 생성자 및 setter 메서드와 함께 사용할 수도 있습니다. |
