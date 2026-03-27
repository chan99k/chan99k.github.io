---
title: "Environment Abstraction"
description: "Spring Framework의 `Environment` 인터페이스는 애플리케이션 환경의 두 가지 핵심 측면인 **프로파일(profiles)** 과 **프로퍼티(properties)** 를 모델링하는 컨테이너 통합 추상화입니다. 프로파일은 특정 조건에서만 활성화되는 빈 정의의 논리적 그룹을 제공하여 개발/QA/운영 환경에 따라 다른 빈을 등록할 수 있게 하며, 프로퍼티는 다양한 소스(프로퍼티 파일, JVM 시스템 프로퍼티, 환경 변수, JNDI 등)에서 설정 값을 통합 관리할 수 있게 합니다. 이 문서는 `@Profile` 애노테이션을 사용한 환경별 빈 설정, 프로파일 표현식과 활성화 방법, `PropertySource` 계층 구조와 우선순위, `@PropertySource` 애노테이션을 통한 커스텀 ..."
pubDate: "2026-03-10"
tags: ["Resources/translations/Spring/IoC Container"]
contentSource: "ai-assisted"
draft: true
---

# Environment Abstraction

> 원문: [Environment Abstraction](https://docs.spring.io/spring-framework/reference/core/beans/environment.html)

## 전문 번역

### 개요 (Overview)

`Environment` 인터페이스는 컨테이너에 통합된 추상화로, 애플리케이션 환경의 두 가지 핵심 측면을 모델링합니다: **프로파일(profiles)**과 **프로퍼티(properties)**.

- **프로파일(profile)**은 주어진 프로파일이 활성화된 경우에만 컨테이너에 등록되는 빈 정의들의 명명된 논리적 그룹입니다.
- **프로퍼티(properties)**는 거의 모든 애플리케이션에서 중요한 역할을 하며, 프로퍼티 파일, JVM 시스템 프로퍼티, 시스템 환경 변수, JNDI, 서블릿 컨텍스트 파라미터 등 다양한 소스에서 유래할 수 있습니다.


### 빈 정의 프로파일 (Bean Definition Profiles)

빈 정의 프로파일은 코어 컨테이너에서 서로 다른 환경에서 서로 다른 빈을 등록할 수 있게 하는 메커니즘을 제공합니다.

#### 일반적인 사용 사례 (Common Use Cases)

1. 개발 환경에서는 인메모리 데이터소스를 사용하지만 QA 또는 운영 환경에서는 JNDI에서 동일한 데이터소스를 조회하는 경우
2. 성능 환경으로 애플리케이션을 배포할 때만 모니터링 인프라를 등록하는 경우
3. 서로 다른 고객 배포를 위해 빈의 커스터마이징된 구현을 등록하는 경우

#### `@Profile` 사용하기 (Using @Profile)

`@Profile` 애노테이션은 하나 이상의 지정된 프로파일이 활성화될 때 컴포넌트가 등록 대상이 됨을 나타낼 수 있게 합니다.

##### 개발 환경 설정 예시 (Development Configuration Example)

**Java:**
```java
@Configuration
@Profile("development")
public class StandaloneDataConfig {

	@Bean
	public DataSource dataSource() {
		return new EmbeddedDatabaseBuilder()
			.setType(EmbeddedDatabaseType.HSQL)
			.addScript("classpath:com/bank/config/sql/schema.sql")
			.addScript("classpath:com/bank/config/sql/test-data.sql")
			.build();
	}
}
```

**Kotlin:**
```kotlin
@Configuration
@Profile("development")
class StandaloneDataConfig {

	@Bean
	fun dataSource(): DataSource {
		return EmbeddedDatabaseBuilder()
				.setType(EmbeddedDatabaseType.HSQL)
				.addScript("classpath:com/bank/config/sql/schema.sql")
				.addScript("classpath:com/bank/config/sql/test-data.sql")
				.build()
	}
}
```

##### 운영 환경 설정 예시 (Production Configuration Example)

**Java:**
```java
@Configuration
@Profile("production")
public class JndiDataConfig {

	@Bean(destroyMethod = "")
	public DataSource dataSource() throws Exception {
		Context ctx = new InitialContext();
		return (DataSource) ctx.lookup("java:comp/env/jdbc/datasource");
	}
}
```

**Kotlin:**
```kotlin
@Configuration
@Profile("production")
class JndiDataConfig {

	@Bean(destroyMethod = "")
	fun dataSource(): DataSource {
		val ctx = InitialContext()
		return ctx.lookup("java:comp/env/jdbc/datasource") as DataSource
	}
}
```

#### 프로파일 표현식 (Profile Expressions)

프로파일 문자열은 단순한 프로파일 이름(예: `production`) 또는 프로파일 표현식을 포함할 수 있습니다.

**지원되는 연산자 (Supported operators):**
- `!`: 논리 NOT
- `&`: 논리 AND
- `|`: 논리 OR

**예시:** `production & (us-east | eu-central)`

> ⚠️ 괄호를 사용하지 않고 `&`와 `|` 연산자를 혼합할 수 없습니다.

#### 메서드 레벨 `@Profile` (Method-Level @Profile)

`@Profile`은 메서드 레벨에서도 선언되어 특정 빈 변형만 포함할 수 있습니다:

**Java:**
```java
@Configuration
public class AppConfig {

	@Bean("dataSource")
	@Profile("development")
	public DataSource standaloneDataSource() {
		return new EmbeddedDatabaseBuilder()
			.setType(EmbeddedDatabaseType.HSQL)
			.addScript("classpath:com/bank/config/sql/schema.sql")
			.addScript("classpath:com/bank/config/sql/test-data.sql")
			.build();
	}

	@Bean("dataSource")
	@Profile("production")
	public DataSource jndiDataSource() throws Exception {
		Context ctx = new InitialContext();
		return (DataSource) ctx.lookup("java:comp/env/jdbc/datasource");
	}
}
```

**Kotlin:**
```kotlin
@Configuration
class AppConfig {

	@Bean("dataSource")
	@Profile("development")
	fun standaloneDataSource(): DataSource {
		return EmbeddedDatabaseBuilder()
				.setType(EmbeddedDatabaseType.HSQL)
				.addScript("classpath:com/bank/config/sql/schema.sql")
				.addScript("classpath:com/bank/config/sql/test-data.sql")
				.build()
	}

	@Bean("dataSource")
	@Profile("production")
	fun jndiDataSource() =
		InitialContext().lookup("java:comp/env/jdbc/datasource") as DataSource
}
```

#### XML 빈 정의 프로파일 (XML Bean Definition Profiles)

XML에서 대응되는 것은 `<beans>` 엘리먼트의 `profile` 속성입니다:

```xml
<beans profile="development"
	xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:jdbc="http://www.springframework.org/schema/jdbc"
	xsi:schemaLocation="...">

	<jdbc:embedded-database id="dataSource">
		<jdbc:script location="classpath:com/bank/config/sql/schema.sql"/>
		<jdbc:script location="classpath:com/bank/config/sql/test-data.sql"/>
	</jdbc:embedded-database>
</beans>

<beans profile="production"
	xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:jee="http://www.springframework.org/schema/jee"
	xsi:schemaLocation="...">

	<jee:jndi-lookup id="dataSource" jndi-name="java:comp/env/jdbc/datasource"/>
</beans>
```

##### 단일 파일에 중첩된 프로파일 (Nested Profiles in Single File)

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:jdbc="http://www.springframework.org/schema/jdbc"
	xmlns:jee="http://www.springframework.org/schema/jee"
	xsi:schemaLocation="...">

	<!-- other bean definitions -->

	<beans profile="development">
		<jdbc:embedded-database id="dataSource">
			<jdbc:script location="classpath:com/bank/config/sql/schema.sql"/>
			<jdbc:script location="classpath:com/bank/config/sql/test-data.sql"/>
		</jdbc:embedded-database>
	</beans>

	<beans profile="production">
		<jee:jndi-lookup id="dataSource" jndi-name="java:comp/env/jdbc/datasource"/>
	</beans>
</beans>
```

##### 중첩된 프로파일을 사용한 논리 AND (Logical AND with Nested Profiles)

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:jdbc="http://www.springframework.org/schema/jdbc"
	xmlns:jee="http://www.springframework.org/schema/jee"
	xsi:schemaLocation="...">

	<!-- other bean definitions -->

	<beans profile="production">
		<beans profile="us-east">
			<jee:jndi-lookup id="dataSource" jndi-name="java:comp/env/jdbc/datasource"/>
		</beans>
	</beans>
</beans>
```

`dataSource` 빈은 `production`과 `us-east` 프로파일이 모두 활성화된 경우에만 노출됩니다.

#### 프로파일 활성화 (Activating a Profile)

프로파일은 `Environment` API를 사용하여 프로그래밍 방식으로 활성화할 수 있습니다:

**Java:**
```java
AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
ctx.getEnvironment().setActiveProfiles("development");
ctx.register(SomeConfig.class, StandaloneDataConfig.class, JndiDataConfig.class);
ctx.refresh();
```

**Kotlin:**
```kotlin
val ctx = AnnotationConfigApplicationContext().apply {
	environment.setActiveProfiles("development")
	register(SomeConfig::class.java, StandaloneDataConfig::class.java, JndiDataConfig::class.java)
	refresh()
}
```

##### 선언적 활성화 (Declarative Activation)

프로파일은 `spring.profiles.active` 프로퍼티를 통해서도 활성화될 수 있습니다:
- 시스템 환경 변수
- JVM 시스템 프로퍼티
- `web.xml`의 서블릿 컨텍스트 파라미터
- JNDI 엔트리
- 통합 테스트에서 `@ActiveProfiles` 애노테이션 사용

##### 여러 프로파일 활성화 (Activating Multiple Profiles)

**프로그래밍 방식:**
```java
ctx.getEnvironment().setActiveProfiles("profile1", "profile2");
```

**선언적 방식:**
```
-Dspring.profiles.active="profile1,profile2"
```

#### 기본 프로파일 (Default Profile)

기본 프로파일은 활성화된 프로파일이 없을 때 활성화됩니다:

**Java:**
```java
@Configuration
@Profile("default")
public class DefaultDataConfig {

	@Bean
	public DataSource dataSource() {
		return new EmbeddedDatabaseBuilder()
			.setType(EmbeddedDatabaseType.HSQL)
			.addScript("classpath:com/bank/config/sql/schema.sql")
			.build();
	}
}
```

**Kotlin:**
```kotlin
@Configuration
@Profile("default")
class DefaultDataConfig {

	@Bean
	fun dataSource(): DataSource {
		return EmbeddedDatabaseBuilder()
				.setType(EmbeddedDatabaseType.HSQL)
				.addScript("classpath:com/bank/config/sql/schema.sql")
				.build()
	}
}
```

기본 프로파일 이름은 `default`이며 다음을 사용하여 변경할 수 있습니다:
- `Environment`의 `setDefaultProfiles()`
- `spring.profiles.default` 프로퍼티


### `PropertySource` 추상화 (PropertySource Abstraction)

Spring의 `Environment` 추상화는 설정 가능한 프로퍼티 소스 계층 구조에 대한 검색 작업을 제공합니다.

#### 기본 사용법 (Basic Usage)

**Java:**
```java
ApplicationContext ctx = new GenericApplicationContext();
Environment env = ctx.getEnvironment();
boolean containsMyProperty = env.containsProperty("my-property");
System.out.println("Does my environment contain the 'my-property' property? " + containsMyProperty);
```

**Kotlin:**
```kotlin
val ctx = GenericApplicationContext()
val env = ctx.environment
val containsMyProperty = env.containsProperty("my-property")
println("Does my environment contain the 'my-property' property? $containsMyProperty")
```

#### 기본 프로퍼티 소스 (Default Property Sources)

`StandardEnvironment`는 두 개의 PropertySource 객체로 구성됩니다:
1. JVM 시스템 프로퍼티 (`System.getProperties()`)
2. 시스템 환경 변수 (`System.getenv()`)

`StandardServletEnvironment`는 추가적인 기본 프로퍼티 소스를 포함합니다:
1. ServletConfig 파라미터
2. ServletContext 파라미터
3. JNDI 환경 변수
4. JndiPropertySource (JNDI를 사용할 수 있는 경우)

#### 프로퍼티 소스 계층 구조 (Property Source Hierarchy - StandardServletEnvironment)

프로퍼티는 다음 순서로 검색됩니다 (우선순위가 높은 것부터):

1. ServletConfig 파라미터 (예: DispatcherServlet 컨텍스트)
2. ServletContext 파라미터 (web.xml의 context-param 엔트리)
3. JNDI 환경 변수 (java:comp/env/ 엔트리)
4. JVM 시스템 프로퍼티 (-D 커맨드라인 인수)
5. JVM 시스템 환경 (운영 체제 환경 변수)

> 참고: 프로퍼티 값은 병합되지 않고 선행 엔트리에 의해 완전히 오버라이드됩니다.

#### 커스텀 프로퍼티 소스 (Custom Property Sources)

커스텀 프로퍼티 소스를 추가하려면:

**Java:**
```java
ConfigurableApplicationContext ctx = new GenericApplicationContext();
MutablePropertySources sources = ctx.getEnvironment().getPropertySources();
sources.addFirst(new MyPropertySource());
```

**Kotlin:**
```kotlin
val ctx = GenericApplicationContext()
val sources = ctx.environment.propertySources
sources.addFirst(MyPropertySource())
```

`MutablePropertySources` API는 프로퍼티 소스의 정밀한 조작을 위한 메서드를 제공합니다.


### `@PropertySource` 사용하기 (Using @PropertySource)

`@PropertySource` 애노테이션은 Spring의 `Environment`에 `PropertySource`를 추가하기 위한 편리하고 선언적인 메커니즘을 제공합니다.

#### 기본 예시 (Basic Example)

다음 내용을 가진 `app.properties` 파일이 주어졌을 때:
```properties
testbean.name=myTestBean
```

**Java:**
```java
@Configuration
@PropertySource("classpath:/com/myco/app.properties")
public class AppConfig {

 @Autowired
 Environment env;

 @Bean
 public TestBean testBean() {
  TestBean testBean = new TestBean();
  testBean.setName(env.getProperty("testbean.name"));
  return testBean;
 }
}
```

**Kotlin:**
```kotlin
@Configuration
@PropertySource("classpath:/com/myco/app.properties")
class AppConfig {

	@Autowired
	private lateinit var env: Environment

	@Bean
	fun testBean() = TestBean().apply {
		name = env.getProperty("testbean.name")!!
	}
}
```

#### 플레이스홀더 해석을 사용한 예시 (With Placeholder Resolution)

`@PropertySource` 리소스 위치의 플레이스홀더는 이미 등록된 프로퍼티 소스 세트에 대해 해석됩니다:

**Java:**
```java
@Configuration
@PropertySource("classpath:/com/${my.placeholder:default/path}/app.properties")
public class AppConfig {

 @Autowired
 Environment env;

 @Bean
 public TestBean testBean() {
  TestBean testBean = new TestBean();
  testBean.setName(env.getProperty("testbean.name"));
  return testBean;
 }
}
```

**Kotlin:**
```kotlin
@Configuration
@PropertySource("classpath:/com/${my.placeholder:default/path}/app.properties")
class AppConfig {

	@Autowired
	private lateinit var env: Environment

	@Bean
	fun testBean() = TestBean().apply {
		name = env.getProperty("testbean.name")!!
	}
}
```

`my.placeholder`가 등록된 프로퍼티 소스에 존재하면 해석됩니다. 그렇지 않으면 `default/path`가 기본값으로 사용됩니다.

> ⚠️ 기본값이 지정되지 않고 프로퍼티를 해석할 수 없는 경우 `IllegalArgumentException`이 발생합니다.

#### 기능 (Features)

- `@PropertySource`는 반복 가능한 애노테이션으로 사용할 수 있습니다
- `@PropertySource`는 커스텀 합성 애노테이션을 생성하기 위한 메타 애노테이션으로 사용할 수 있습니다


### 구문에서의 플레이스홀더 해석 (Placeholder Resolution in Statements)

역사적으로 플레이스홀더는 JVM 시스템 프로퍼티나 환경 변수에 대해서만 해석될 수 있었습니다. 이는 더 이상 사실이 아닙니다. `Environment` 추상화는 컨테이너 전체에 통합되어 유연한 플레이스홀더 해석을 가능하게 합니다.

#### 예시 (Example)

다음 구문은 `customer` 프로퍼티가 `Environment`에서 사용 가능하기만 하면 어디에 정의되어 있든 작동합니다:

```xml
<beans>
	<import resource="com/bank/service/${customer}-config.xml"/>
</beans>
```


### 탐색 (Navigation)

**이전:** [프로그래밍 방식의 빈 등록 (Programmatic Bean Registration)](java/programmatic-bean-registration.html)
**다음:** [`LoadTimeWeaver` 등록하기 (Registering a LoadTimeWeaver)](context-load-time-weaver.html)
