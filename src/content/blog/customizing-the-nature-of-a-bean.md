---
title: "Customizing the Nature of a Bean"
description: "Spring Framework는 빈(bean)의 동작을 커스터마이징하기 위한 여러 인터페이스를 제공합니다. 크게 세 가지 범주로 구분됩니다: (1) 라이프사이클 콜백(Lifecycle Callbacks) - 초기화 및 소멸 단계에서 커스텀 로직 실행, (2) ApplicationContextAware 및 BeanNameAware - 컨테이너나 빈 이름에 대한 참조 획득, (3) 기타 Aware 인터페이스 - 다양한 인프라 의존성 주입.

라이프사이클 관리는 `@PostConstruct`/`@PreDestroy` 어노테이션, `init-method`/`destroy-method` XML 설정, 또는 `InitializingBean`/`DisposableBean` 인터페이스 구현을 통해 가능하며, Spri..."
pubDate: "2026-03-10"
tags: ["Resources/translations/spring/core/ioc-container"]
contentSource: "ai-assisted"
series: "Spring IoC Container"
seriesOrder: 10
draft: false
---

# Customizing the Nature of a Bean

> 원문: [Customizing the Nature of a Bean](https://docs.spring.io/spring-framework/reference/core/beans/factory-nature.html)

## 전문 번역

Spring Framework는 빈의 특성을 커스터마이징하기 위한 여러 인터페이스를 제공하며, 다음과 같이 그룹화됩니다:

1. **라이프사이클 콜백 (Lifecycle Callbacks)**
2. **ApplicationContextAware와 BeanNameAware**
3. **기타 Aware 인터페이스들 (Other Aware Interfaces)**


### 라이프사이클 콜백 (Lifecycle Callbacks)

컨테이너의 빈 라이프사이클 관리와 상호작용하기 위해, Spring의 `InitializingBean`과 `DisposableBean` 인터페이스를 구현할 수 있습니다. 컨테이너는 전자의 경우 `afterPropertiesSet()`을, 후자의 경우 `destroy()`를 호출하여 빈이 초기화 및 소멸 시 특정 작업을 수행하도록 합니다.

#### 초기화 콜백 (Initialization Callbacks)

`org.springframework.beans.factory.InitializingBean` 인터페이스는 컨테이너가 빈의 모든 필요한 프로퍼티를 설정한 후 초기화 작업을 수행할 수 있도록 합니다:

```java
void afterPropertiesSet() throws Exception;
```

**권장사항 (Best Practice)**: `InitializingBean` 인터페이스 사용은 권장되지 않습니다. 코드를 Spring에 불필요하게 결합시키기 때문입니다. 대안으로 `@PostConstruct` 어노테이션을 사용하거나 POJO 초기화 메서드를 지정하는 것을 권장합니다.

##### XML 기반 설정 메타데이터 예시:
```xml
<bean id="exampleInitBean" class="examples.ExampleBean" init-method="init"/>
```

##### Java 구현:
```java
public class ExampleBean {
    public void init() {
        // do some initialization work
    }
}
```

위 예시는 다음과 동일합니다:

```java
public class AnotherExampleBean implements InitializingBean {
    @Override
    public void afterPropertiesSet() {
        // do some initialization work
    }
}
```

하지만 앞의 두 예시 중 첫 번째는 코드를 Spring에 결합시키지 않습니다.

> **중요 참고사항**: `@PostConstruct` 및 초기화 메서드는 일반적으로 컨테이너의 싱글톤 생성 락(singleton creation lock) 내에서 실행됩니다. 빈 인스턴스는 `@PostConstruct` 메서드에서 반환된 후에야 완전히 초기화되고 다른 곳에 게시될 준비가 된 것으로 간주됩니다. 이러한 개별 초기화 메서드는 설정 상태를 검증하고 주어진 설정에 기초하여 일부 데이터 구조를 준비하는 용도로만 사용되어야 하며, 외부 빈 접근과 같은 추가 활동은 없어야 합니다. 그렇지 않으면 초기화 데드락의 위험이 있습니다. 비용이 많이 드는 사후 초기화 활동(예: 비동기 데이터베이스 준비 단계)이 트리거되어야 하는 시나리오의 경우, 빈은 `SmartInitializingSingleton.afterSingletonsInstantiated()`를 구현하거나 컨텍스트 리프레시 이벤트에 의존해야 합니다: `ApplicationListener<ContextRefreshedEvent>`를 구현하거나, 동등한 어노테이션 `@EventListener(ContextRefreshedEvent.class)`를 선언합니다. 이러한 변형들은 모든 일반 싱글톤 초기화 이후에 오므로 싱글톤 생성 락 외부에 있습니다.

#### 소멸 콜백 (Destruction Callbacks)

`org.springframework.beans.factory.DisposableBean` 인터페이스를 구현하면 빈을 포함하는 컨테이너가 소멸될 때 콜백을 받을 수 있습니다:

```java
void destroy() throws Exception;
```

**권장사항 (Best Practice)**: `DisposableBean` 콜백 인터페이스 사용은 권장되지 않습니다. 코드를 Spring에 불필요하게 결합시키기 때문입니다. 대안으로 `@PreDestroy` 어노테이션을 사용하거나 빈 정의에서 지원하는 제네릭 메서드를 지정하는 것을 권장합니다.

##### XML 기반 설정 메타데이터 예시:
```xml
<bean id="exampleDestructionBean" class="examples.ExampleBean" destroy-method="cleanup"/>
```

##### Java 구현:
```java
public class ExampleBean {
    public void cleanup() {
        // do some destruction work (like releasing pooled connections)
    }
}
```

위 정의는 다음과 동일합니다:

```java
public class AnotherExampleBean implements DisposableBean {
    @Override
    public void destroy() {
        // do some destruction work (like releasing pooled connections)
    }
}
```

하지만 앞의 두 정의 중 첫 번째는 코드를 Spring에 결합시키지 않습니다.

##### 자동 감지 기능 (Auto-detection Feature)

XML 기반 설정 메타데이터의 `<bean>` 요소에서 `destroy-method` 속성에 특별한 `(inferred)` 값을 할당할 수 있습니다. 이는 Spring이 특정 빈 클래스의 public `close` 또는 `shutdown` 메서드를 자동으로 감지하도록 지시합니다. 또한 `<beans>` 요소의 `default-destroy-method` 속성에 이 특별한 `(inferred)` 값을 설정하여 전체 빈 정의 집합에 이 동작을 적용할 수도 있습니다 (기본 초기화 및 소멸 메서드 참조).

#### 기본 초기화 및 소멸 메서드 (Default Initialization and Destroy Methods)

Spring을 사용하지 않는 초기화 및 소멸 메서드 콜백을 작성할 때, 일반적으로 `init()`, `initialize()`, `dispose()` 등의 이름을 가진 메서드를 작성합니다. 이상적으로는, 이러한 라이프사이클 콜백 메서드의 이름이 프로젝트 전체에서 표준화되어 모든 개발자가 동일한 메서드 이름을 사용하고 일관성을 보장합니다.

Spring 컨테이너가 모든 빈에서 명명된 초기화 및 소멸 콜백 메서드 이름을 "찾도록" 설정할 수 있습니다. 즉, 애플리케이션 개발자는 애플리케이션 클래스를 작성하고 각 빈 정의마다 `init-method="init"` 속성을 설정할 필요 없이 `init()`이라는 초기화 콜백을 사용할 수 있습니다. Spring IoC 컨테이너는 빈이 생성될 때 해당 메서드를 호출합니다(앞서 설명한 표준 라이프사이클 콜백 계약에 따라). 이 기능은 또한 초기화 및 소멸 메서드 콜백에 대한 일관된 명명 규칙을 강제합니다.

초기화 콜백 메서드가 `init()`이고 소멸 콜백 메서드가 `destroy()`라고 가정합니다. 클래스는 다음 예제의 클래스와 유사합니다:

```java
public class DefaultBlogService implements BlogService {

    private BlogDao blogDao;

    public void setBlogDao(BlogDao blogDao) {
        this.blogDao = blogDao;
    }

    // this is (unsurprisingly) the initialization callback method
    public void init() {
        if (this.blogDao == null) {
            throw new IllegalStateException("The [blogDao] property must be set.");
        }
    }
}
```

그런 다음 다음과 유사한 빈에서 해당 클래스를 사용할 수 있습니다:

```xml
<beans default-init-method="init">

    <bean id="blogService" class="com.something.DefaultBlogService">
        <property name="blogDao" ref="blogDao" />
    </bean>

</beans>
```

최상위 `<beans/>` 요소 속성의 `default-init-method` 속성이 있으면 Spring IoC 컨테이너가 빈의 클래스에서 `init`이라는 메서드를 초기화 메서드 콜백으로 인식하게 됩니다. 빈이 생성되고 조립될 때, 빈 클래스에 그러한 메서드가 있으면 적절한 시점에 호출됩니다.

최상위 `<beans/>` 요소의 `default-destroy-method` 속성을 사용하여 소멸 메서드 콜백을 유사하게 설정(즉, XML에서)합니다.

기존 빈 클래스에 이미 규칙에 따라 다르게 명명된 콜백 메서드가 있는 경우, `<bean/>`의 `init-method`와 `destroy-method` 속성을 사용하여 메서드 이름을 지정함으로써 기본값을 재정의할 수 있습니다.

Spring 컨테이너는 설정된 초기화 콜백이 빈에 모든 의존성이 제공된 직후 호출되도록 보장합니다. 따라서 초기화 콜백은 원시 빈 참조에서 호출되며, 이는 AOP 인터셉터 등이 아직 빈에 적용되지 않았음을 의미합니다. 타겟 빈이 먼저 완전히 생성된 다음 AOP 프록시(예를 들어)가 인터셉터 체인과 함께 적용됩니다. 타겟 빈과 프록시가 별도로 정의되면 코드는 프록시를 우회하여 원시 타겟 빈과 상호작용할 수도 있습니다. 따라서 `init` 메서드에 인터셉터를 적용하는 것은 일관성이 없을 것입니다. 그렇게 하면 타겟 빈의 라이프사이클을 프록시 또는 인터셉터에 결합시키고 코드가 원시 타겟 빈과 직접 상호작용할 때 이상한 의미를 남기게 됩니다.

#### 라이프사이클 메커니즘 결합 (Combining Lifecycle Mechanisms)

Spring 2.5부터는 빈 라이프사이클 동작을 제어하기 위한 세 가지 옵션이 있습니다:

- `InitializingBean`과 `DisposableBean` 콜백 인터페이스
- 커스텀 `init()` 및 `destroy()` 메서드
- `@PostConstruct`와 `@PreDestroy` 어노테이션

이러한 메커니즘을 결합하여 주어진 빈을 제어할 수 있습니다.

> **참고**: 빈에 대해 여러 라이프사이클 메커니즘이 설정되고 각 메커니즘이 다른 메서드 이름으로 설정된 경우, 각 설정된 메서드는 이 노트 다음에 나열된 순서대로 실행됩니다. 그러나 동일한 메서드 이름이 설정된 경우(예: 초기화 메서드에 대해 `init()`) - 이러한 라이프사이클 메커니즘 중 하나 이상에 대해, 해당 메서드는 앞 섹션에서 설명한 대로 한 번 실행됩니다.

동일한 빈에 대해 다른 초기화 메서드로 설정된 여러 라이프사이클 메커니즘은 다음과 같이 호출됩니다:

1. `@PostConstruct`로 어노테이션된 메서드
2. `InitializingBean` 콜백 인터페이스에 정의된 `afterPropertiesSet()`
3. 커스텀 설정된 `init()` 메서드

소멸 메서드도 동일한 순서로 호출됩니다:

1. `@PreDestroy`로 어노테이션된 메서드
2. `DisposableBean` 콜백 인터페이스에 정의된 `destroy()`
3. 커스텀 설정된 `destroy()` 메서드

#### 시작 및 종료 콜백 (Startup and Shutdown Callbacks)

`Lifecycle` 인터페이스는 자체 라이프사이클 요구사항이 있는 모든 객체에 대한 필수 메서드를 정의합니다(예: 일부 백그라운드 프로세스 시작 및 중지):

```java
public interface Lifecycle {

    void start();

    void stop();

    boolean isRunning();
}
```

모든 Spring 관리 객체는 `Lifecycle` 인터페이스를 구현할 수 있습니다. 그러면 `ApplicationContext` 자체가 시작 및 중지 신호를 받을 때(예: 런타임의 중지/재시작 시나리오), 해당 컨텍스트 내에 정의된 모든 `Lifecycle` 구현에 해당 호출을 캐스케이드합니다. 이는 다음에 나열된 `LifecycleProcessor`에 위임하여 수행합니다:

```java
public interface LifecycleProcessor extends Lifecycle {

    void onRefresh();

    void onClose();
}
```

`LifecycleProcessor`는 `Lifecycle` 인터페이스의 확장입니다. 또한 리프레시되고 닫히는 컨텍스트에 반응하기 위한 두 가지 다른 메서드를 추가합니다.

> **참고**: 일반 `org.springframework.context.Lifecycle` 인터페이스는 명시적 시작 및 중지 알림을 위한 일반 계약이며 컨텍스트 리프레시 시 자동 시작을 의미하지 않습니다. 특정 빈의 자동 시작(시작 단계 포함)에 대한 세밀한 제어를 위해 대신 `org.springframework.context.SmartLifecycle`을 구현하는 것을 고려하십시오.
>
> 또한 중지 알림이 소멸 전에 오는 것이 보장되지 않습니다. 정기적 종료 시, 모든 `Lifecycle` 빈은 일반 소멸 콜백이 전파되기 전에 먼저 중지 알림을 받습니다. 그러나 컨텍스트의 라이프타임 동안 핫 리프레시 또는 중지된 리프레시 시도 시에는 소멸 메서드만 호출됩니다.

시작 및 종료 호출의 순서는 중요할 수 있습니다. 두 객체 간에 "의존" 관계가 존재하는 경우, 의존하는 쪽은 의존성 이후에 시작하고 의존성 이전에 중지합니다. 그러나 때로는 직접적인 의존성을 알 수 없습니다. 특정 유형의 객체가 다른 유형의 객체보다 먼저 시작해야 한다는 것만 알 수 있습니다. 이러한 경우, `SmartLifecycle` 인터페이스는 또 다른 옵션, 즉 슈퍼 인터페이스 `Phased`에 정의된 `getPhase()` 메서드를 정의합니다. 다음 목록은 `Phased` 인터페이스의 정의를 보여줍니다:

```java
public interface Phased {

    int getPhase();
}
```

다음 목록은 `SmartLifecycle` 인터페이스의 정의를 보여줍니다:

```java
public interface SmartLifecycle extends Lifecycle, Phased {

    boolean isAutoStartup();

    void stop(Runnable callback);
}
```

시작할 때, 가장 낮은 phase를 가진 객체가 먼저 시작합니다. 중지할 때는 반대 순서를 따릅니다. 따라서 `SmartLifecycle`을 구현하고 `getPhase()` 메서드가 `Integer.MIN_VALUE`를 반환하는 객체는 가장 먼저 시작하고 가장 마지막에 중지하는 객체 중 하나입니다. 스펙트럼의 다른 쪽 끝에서, `Integer.MAX_VALUE`의 phase 값은 객체가 마지막에 시작하고 먼저 중지해야 함을 나타냅니다(실행 중인 다른 프로세스에 의존하기 때문일 수 있음). phase 값을 고려할 때, `SmartLifecycle`을 구현하지 않는 "일반" `Lifecycle` 객체의 기본 phase는 `0`이라는 것을 아는 것도 중요합니다. 따라서 모든 음수 phase 값은 객체가 표준 구성요소보다 먼저 시작해야 함(그리고 그 후에 중지해야 함)을 나타냅니다. 양수 phase 값의 경우 그 반대입니다.

`SmartLifecycle`에 정의된 stop 메서드는 콜백을 받습니다. 모든 구현은 해당 구현의 종료 프로세스가 완료된 후 해당 콜백의 `run()` 메서드를 호출해야 합니다. 이는 `LifecycleProcessor` 인터페이스의 기본 구현인 `DefaultLifecycleProcessor`가 각 phase 내의 객체 그룹이 해당 콜백을 호출할 때까지 타임아웃 값까지 기다리기 때문에 필요할 때 비동기 종료를 가능하게 합니다. 기본 phase별 타임아웃은 30초입니다. 컨텍스트 내에서 `lifecycleProcessor`라는 빈을 정의하여 기본 라이프사이클 프로세서 인스턴스를 재정의할 수 있습니다. 타임아웃만 수정하려면 다음을 정의하는 것으로 충분합니다:

```xml
<bean id="lifecycleProcessor" class="org.springframework.context.support.DefaultLifecycleProcessor">
    <!-- timeout value in milliseconds -->
    <property name="timeoutPerShutdownPhase" value="10000"/>
</bean>
```

앞서 언급했듯이, `LifecycleProcessor` 인터페이스는 컨텍스트의 리프레시 및 닫기를 위한 콜백 메서드도 정의합니다. 후자는 `stop()`이 명시적으로 호출된 것처럼 종료 프로세스를 구동하지만 컨텍스트가 닫힐 때 발생합니다. 반면 'refresh' 콜백은 `SmartLifecycle` 빈의 또 다른 기능을 활성화합니다. 컨텍스트가 리프레시될 때(모든 객체가 인스턴스화되고 초기화된 후), 해당 콜백이 호출됩니다. 그 시점에서 기본 라이프사이클 프로세서는 각 `SmartLifecycle` 객체의 `isAutoStartup()` 메서드에서 반환된 부울 값을 확인합니다. `true`이면 해당 객체는 컨텍스트 또는 자체 `start()` 메서드의 명시적 호출을 기다리지 않고 그 시점에서 시작됩니다(컨텍스트 리프레시와 달리, 표준 컨텍스트 구현에서는 컨텍스트 시작이 자동으로 발생하지 않습니다). `phase` 값과 "의존" 관계는 앞서 설명한 대로 시작 순서를 결정합니다.

#### 비웹 애플리케이션에서 Spring IoC 컨테이너를 우아하게 종료하기 (Shutting Down the Spring IoC Container Gracefully in Non-Web Applications)

> **참고**: 이 섹션은 비웹 애플리케이션에만 적용됩니다. Spring의 웹 기반 `ApplicationContext` 구현에는 관련 웹 애플리케이션이 종료될 때 Spring IoC 컨테이너를 우아하게 종료하기 위한 코드가 이미 있습니다.

비웹 애플리케이션 환경(예: 리치 클라이언트 데스크톱 환경)에서 Spring의 IoC 컨테이너를 사용하는 경우, JVM에 종료 훅(shutdown hook)을 등록하십시오. 그렇게 하면 우아한 종료를 보장하고 관련 리소스가 해제되도록 싱글톤 빈에서 관련 소멸 메서드를 호출합니다. 이러한 소멸 콜백을 올바르게 설정하고 구현해야 합니다.

종료 훅을 등록하려면 `ConfigurableApplicationContext` 인터페이스에 선언된 `registerShutdownHook()` 메서드를 호출하십시오. 다음 예제를 참조하십시오:

```java
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public final class Boot {

    public static void main(final String[] args) throws Exception {
        ConfigurableApplicationContext ctx = new ClassPathXmlApplicationContext("beans.xml");

        // add a shutdown hook for the above context...
        ctx.registerShutdownHook();

        // app runs here...

        // main method exits, hook is called prior to the app shutting down...
    }
}
```

#### 스레드 안전성 및 가시성 (Thread Safety and Visibility)

빈 설정 메타데이터는 템플릿 정의이며, 다양한 방식으로 표현될 수 있습니다: XML, 어노테이션, Java 설정 클래스, 또는 최근의 `@Bean` 팩토리 메서드. 중요한 것은 Spring이 실제 빈을 인스턴스화할 때, 빈 인스턴스와 그 설정 상태가 올바르게 게시되어야 한다는 것입니다.

공식 빈 정의에서 빈의 의존성으로 선언된 객체의 경우, Spring은 일반 인스턴스화와 생성자 주입 또는 팩토리 메서드를 통해 이를 처리합니다. 일반 설정 필드는 설정 단계 중에만 변경되고 그 이후로는 효과적으로 읽기 전용이 됩니다. 따라서 `volatile`일 필요가 없으며 일반 싱글톤 락 내에서 처리됩니다. Spring의 팩토리 메서드(예: `@Bean`)에서 반환된 싱글톤 인스턴스는 Spring의 싱글톤 락을 통해 스레드 안전 방식으로 게시됩니다. 일반적으로 이러한 필드를 `volatile` 등으로 표시할 필요가 없습니다.

그러나 런타임에 빈이 변경되는 경우, 이러한 필드는 `volatile`이거나 공통 락으로 보호되어야 합니다. 그렇지 않으면 JMM(Java Memory Model) 수준에서 가시성 문제의 위험이 있습니다. 일반적인 권장사항은 런타임 상태를 `ConcurrentHashMap` 인스턴스와 같이 본질적으로 스레드 안전한 구조로 유지하는 것입니다. 싱글톤으로 등록할 목적으로 팩토리 메서드(예: `@Bean`)에서 반환하는 빈 인스턴스는 JVM 가시성 목적으로 스레드 안전하게 구성되어야 합니다. 이상적으로는 생성자에서 완전히 구성되고 그렇지 않으면 표준 JavaBeans 규칙을 따릅니다.

런타임 상태를 변경하는 특별한 프로세스(예: 런타임에 대량 데이터를 로드하기 위한 수동 `start()` 메서드)가 있는 경우, 이 런타임 상태를 `volatile` 필드 또는 공통 락 뒤에 배치하거나 `SmartLifecycle` start/stop 콜백과 같은 수명 관리 통합에서 모든 액세스를 트리거하고 `isRunning()` 체크 결과를 신뢰할 수 있도록 하는 것을 고려하십시오. 이렇게 하면 스레드 안전성에 대해 적극적으로 생각하게 되고 Spring의 일반 수명 관리와의 통합을 개선하게 됩니다.


### ApplicationContextAware와 BeanNameAware

`ApplicationContext`가 `org.springframework.context.ApplicationContextAware` 인터페이스를 구현하는 객체 인스턴스를 생성할 때, 인스턴스에는 해당 `ApplicationContext`에 대한 참조가 제공됩니다. 다음 목록은 `ApplicationContextAware` 인터페이스의 정의를 보여줍니다:

```java
public interface ApplicationContextAware {

    void setApplicationContext(ApplicationContext applicationContext) throws BeansException;
}
```

따라서 빈은 프로그래밍 방식으로 자신을 생성한 `ApplicationContext`를 조작할 수 있습니다. `ApplicationContext` 인터페이스를 통해 또는 이 인터페이스의 알려진 하위 클래스(예: 추가 기능을 노출하는 `ConfigurableApplicationContext`)로 참조를 캐스팅하여 조작할 수 있습니다. 한 가지 용도는 다른 빈의 프로그래밍 방식 검색입니다. 때때로 이 기능이 유용합니다. 그러나 일반적으로 이를 피해야 합니다. 이는 코드를 Spring에 결합시키고 Inversion of Control 스타일을 따르지 않기 때문입니다(협력자가 빈에 프로퍼티로 제공되어야 함). `ApplicationContext`의 다른 메서드는 파일 리소스에 대한 액세스, 애플리케이션 이벤트 게시, `MessageSource` 액세스를 제공합니다. 이러한 추가 기능은 Additional Capabilities of the ApplicationContext에 설명되어 있습니다.

자동 와이어링은 `ApplicationContext`에 대한 참조를 얻는 또 다른 대안입니다. 전통적인 `constructor`와 `byType` 자동 와이어링 모드(Autowiring Collaborators에 설명된 대로)는 각각 생성자 인수 또는 setter 메서드 매개변수에 대해 `ApplicationContext` 유형의 의존성을 제공할 수 있습니다. 필드와 여러 매개변수 메서드를 자동 와이어링하는 기능을 포함하여 더 많은 유연성을 위해 어노테이션 기반 자동 와이어링 기능을 사용하십시오. 그렇게 하면 필드, 생성자 또는 메서드가 `@Autowired` 어노테이션을 가지고 있는 경우 `ApplicationContext`는 `ApplicationContext` 유형을 예상하는 필드, 생성자 인수 또는 메서드 매개변수에 자동 와이어링됩니다. 자세한 내용은 Using @Autowired를 참조하십시오.

`ApplicationContext`가 `org.springframework.beans.factory.BeanNameAware` 인터페이스를 구현하는 클래스를 생성할 때, 클래스에는 관련 객체 정의에 정의된 이름에 대한 참조가 제공됩니다. 다음 목록은 BeanNameAware 인터페이스의 정의를 보여줍니다:

```java
public interface BeanNameAware {

    void setBeanName(String name) throws BeansException;
}
```

콜백은 일반 빈 프로퍼티가 채워진 후에 호출되지만 `InitializingBean.afterPropertiesSet()` 또는 커스텀 init-method와 같은 초기화 콜백 전에 호출됩니다.


### 기타 Aware 인터페이스 (Other Aware Interfaces)

`ApplicationContextAware`와 `BeanNameAware`(앞서 논의됨) 외에도, Spring은 빈이 컨테이너에 특정 인프라 의존성이 필요함을 나타낼 수 있는 광범위한 `Aware` 콜백 인터페이스를 제공합니다. 일반적인 규칙으로, 이름은 의존성 유형을 나타냅니다. 다음 표는 가장 중요한 `Aware` 인터페이스를 요약합니다:

| 이름 (Name) | 주입되는 의존성 (Injected Dependency) | 설명 참조 (Explained in…) |
|------|-------------------|-----------|
| `ApplicationContextAware` | 선언하는 `ApplicationContext` | ApplicationContextAware and BeanNameAware |
| `ApplicationEventPublisherAware` | 둘러싸는 `ApplicationContext`의 이벤트 퍼블리셔 | Additional Capabilities of the ApplicationContext |
| `BeanClassLoaderAware` | 빈 클래스를 로드하는 데 사용되는 클래스 로더 | Instantiating Beans |
| `BeanFactoryAware` | 선언하는 `BeanFactory` | The BeanFactory API |
| `BeanNameAware` | 선언하는 빈의 이름 | ApplicationContextAware and BeanNameAware |
| `LoadTimeWeaverAware` | 로드 시 클래스 정의를 처리하기 위해 정의된 위버(weaver) | Load-time Weaving with AspectJ in the Spring Framework |
| `MessageSourceAware` | 메시지를 해결하기 위한 설정된 전략(매개변수화 및 국제화 지원 포함) | Additional Capabilities of the ApplicationContext |
| `NotificationPublisherAware` | Spring JMX 알림 퍼블리셔 | Notifications |
| `ResourceLoaderAware` | 리소스에 대한 낮은 수준의 액세스를 위한 설정된 로더 | Resources |
| `ServletConfigAware` | 컨테이너가 실행되는 현재 `ServletConfig`. 웹 인식 Spring `ApplicationContext`에서만 유효 | Spring MVC |
| `ServletContextAware` | 컨테이너가 실행되는 현재 `ServletContext`. 웹 인식 Spring `ApplicationContext`에서만 유효 | Spring MVC |

이러한 인터페이스를 사용하면 코드가 Spring API에 결합되고 Inversion of Control 스타일을 따르지 않습니다. 결과적으로, 컨테이너에 프로그래밍 방식 액세스가 필요한 인프라 빈에 대해 권장합니다.
