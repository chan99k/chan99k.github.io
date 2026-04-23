---
title: "Method Injection"
description: "메서드 인젝션(Method Injection)은 Spring IoC 컨테이너의 고급 기능으로, 서로 다른 라이프사이클을 가진 빈들 간의 의존성 문제를 해결합니다. 특히 싱글톤 빈이 프로토타입 빈을 사용해야 할 때, 매번 새로운 인스턴스를 받을 수 있도록 해줍니다. Spring은 CGLIB 라이브러리를 사용하여 바이트코드를 동적으로 생성하고 서브클래스를 만들어 메서드를 오버라이드하는 방식으로 이를 구현합니다."
pubDate: "2026-03-10"
tags: ["Resources/translations/spring/core/ioc-container"]
contentSource: "ai-assisted"
series: "Spring IoC Container"
seriesOrder: 8
draft: false
---

# Method Injection

> 원문: [Method Injection](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-method-injection.html)

## 전문 번역

대부분의 애플리케이션 시나리오에서 컨테이너 내의 대부분의 빈은 [싱글톤](../factory-scopes.html#beans-factory-scopes-singleton)입니다. 싱글톤 빈이 다른 싱글톤 빈과 협력해야 하거나, 비싱글톤 빈이 다른 비싱글톤 빈과 협력해야 할 때는 일반적으로 한 빈을 다른 빈의 프로퍼티로 정의하여 의존성을 처리합니다. 그러나 빈의 라이프사이클이 서로 다를 때 문제가 발생합니다. 싱글톤 빈 A가 비싱글톤(프로토타입) 빈 B를 사용해야 하는 경우를 가정해봅시다. 아마도 A의 각 메서드 호출마다 B가 필요할 것입니다. 컨테이너는 싱글톤 빈 A를 한 번만 생성하므로, 프로퍼티를 설정할 기회도 한 번만 얻습니다. 컨테이너는 필요할 때마다 빈 A에게 빈 B의 새 인스턴스를 제공할 수 없습니다.

한 가지 해결책은 제어의 역전(inversion of control)을 일부 포기하는 것입니다. `ApplicationContextAware` 인터페이스를 구현하여 [빈 A가 컨테이너를 인식하도록](../factory-nature.html#beans-factory-aware) 만들고, 빈 A가 필요할 때마다 [`getBean("B")` 호출로 컨테이너에게](../basics.html#beans-factory-client) (일반적으로 새로운) 빈 B 인스턴스를 요청할 수 있습니다. 다음 예제는 이 접근 방식을 보여줍니다:

**Java**
```java
package fiona.apple;

// Spring-API imports
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

/**
 * A class that uses a stateful Command-style class to perform
 * some processing.
 */
public class CommandManager implements ApplicationContextAware {

    private ApplicationContext applicationContext;

    public Object process(Map commandState) {
        // grab a new instance of the appropriate Command
        Command command = createCommand();
        // set the state on the (hopefully brand new) Command instance
        command.setState(commandState);
        return command.execute();
    }

    protected Command createCommand() {
        // notice the Spring API dependency!
        return this.applicationContext.getBean("command", Command.class);
    }

    public void setApplicationContext(
            ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }
}
```

앞의 코드는 바람직하지 않습니다. 비즈니스 코드가 Spring Framework를 인식하고 결합되어 있기 때문입니다. Spring IoC 컨테이너의 다소 고급 기능인 메서드 인젝션(Method Injection)을 사용하면 이 사용 사례를 깔끔하게 처리할 수 있습니다.

메서드 인젝션의 동기에 대해 더 자세히 알고 싶다면 [이 블로그 글](https://spring.io/blog/2004/08/06/method-injection/)을 참고하세요.

### Lookup Method Injection (룩업 메서드 인젝션)

Lookup Method Injection은 컨테이너가 관리하는 빈의 메서드를 오버라이드하여 컨테이너 내의 다른 명명된 빈에 대한 룩업 결과를 반환하는 기능입니다. 룩업은 일반적으로 [앞 섹션](#)에서 설명한 시나리오처럼 프로토타입 빈을 포함합니다. Spring Framework는 CGLIB 라이브러리의 바이트코드 생성을 사용하여 메서드를 오버라이드하는 서브클래스를 동적으로 생성함으로써 이 메서드 인젝션을 구현합니다.

> **Note**
>
> 이 동적 서브클래싱이 작동하려면 다음 사항을 유의해야 합니다:
>
> - Spring 빈 컨테이너가 서브클래싱할 클래스는 `final`이 될 수 없으며, 오버라이드될 메서드도 `final`이 될 수 없습니다.
> - `abstract` 메서드를 가진 클래스를 단위 테스트하려면 클래스를 직접 서브클래싱하고 `abstract` 메서드의 스텁 구현을 제공해야 합니다.
> - 또 다른 핵심 제한 사항은 룩업 메서드가 팩토리 메서드와 함께 작동하지 않으며, 특히 설정 클래스의 `@Bean` 메서드와는 작동하지 않는다는 것입니다. 이 경우 컨테이너가 인스턴스 생성을 담당하지 않으므로 런타임 생성 서브클래스를 즉석에서 만들 수 없기 때문입니다.

앞의 코드 스니펫에서 `CommandManager` 클래스의 경우, Spring 컨테이너는 `createCommand()` 메서드의 구현을 동적으로 오버라이드합니다. 다음 재작업된 예제에서 볼 수 있듯이 `CommandManager` 클래스는 Spring 의존성을 전혀 갖지 않습니다:

**Java**
```java
package fiona.apple;

// no more Spring imports!

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

주입될 메서드를 포함하는 클라이언트 클래스(이 경우 `CommandManager`)에서 주입될 메서드는 다음 형식의 시그니처를 요구합니다:

```xml
<public|protected> [abstract] <return-type> theMethodName(no-arguments);
```

메서드가 `abstract`이면 동적으로 생성된 서브클래스가 메서드를 구현합니다. 그렇지 않으면 동적으로 생성된 서브클래스가 원래 클래스에 정의된 구체적인 메서드를 오버라이드합니다. 다음 예제를 고려해보세요:

```xml
<!-- a stateful bean deployed as a prototype (non-singleton) -->
<bean id="myCommand" class="fiona.apple.AsyncCommand" scope="prototype">
    <!-- inject dependencies here as required -->
</bean>

<!-- commandManager uses myCommand prototype bean -->
<bean id="commandManager" class="fiona.apple.CommandManager">
    <lookup-method name="createCommand" bean="myCommand"/>
</bean>
```

`commandManager`로 식별된 빈은 `myCommand` 빈의 새 인스턴스가 필요할 때마다 자체 `createCommand()` 메서드를 호출합니다. 실제로 필요한 경우 `myCommand` 빈을 프로토타입으로 배포하도록 주의해야 합니다. [싱글톤](../factory-scopes.html#beans-factory-scopes-singleton)이면 매번 동일한 `myCommand` 빈 인스턴스가 반환됩니다.

또는 어노테이션 기반 컴포넌트 모델 내에서 다음 예제와 같이 `@Lookup` 어노테이션을 통해 룩업 메서드를 선언할 수 있습니다:

**Java**
```java
public abstract class CommandManager {

    public Object process(Object commandState) {
        Command command = createCommand();
        command.setState(commandState);
        return command.execute();
    }

    @Lookup("myCommand")
    protected abstract Command createCommand();
}
```

또는 더 관용적으로, 룩업 메서드의 선언된 반환 타입에 따라 대상 빈이 해석되도록 할 수 있습니다:

**Java**
```java
public abstract class CommandManager {

    public Object process(Object commandState) {
        Command command = createCommand();
        command.setState(commandState);
        return command.execute();
    }

    @Lookup
    protected abstract Command createCommand();
}
```

> **Tip**
>
> 다르게 스코프가 지정된 대상 빈에 액세스하는 또 다른 방법은 `ObjectFactory`/`Provider` 인젝션 포인트입니다. [Scoped Beans as Dependencies](../factory-scopes.html#beans-factory-scopes-other-injection)를 참조하세요.
>
> `org.springframework.beans.factory.config` 패키지의 `ServiceLocatorFactoryBean`도 유용할 수 있습니다.

### Arbitrary Method Replacement (임의 메서드 교체)

Lookup Method Injection보다 덜 유용한 메서드 인젝션 형태는 관리되는 빈의 임의 메서드를 다른 메서드 구현으로 교체하는 기능입니다. 이 기능이 실제로 필요할 때까지는 이 섹션의 나머지 부분을 안전하게 건너뛸 수 있습니다.

XML 기반 설정 메타데이터를 사용하면 배포된 빈에 대해 `replaced-method` 엘리먼트를 사용하여 기존 메서드 구현을 다른 구현으로 교체할 수 있습니다. 오버라이드하려는 `computeValue`라는 메서드가 있는 다음 클래스를 고려해보세요:

**Java**
```java
public class MyValueCalculator {

    public String computeValue(String input) {
        // some real code...
    }

    // some other methods...
}
```

`org.springframework.beans.factory.support.MethodReplacer` 인터페이스를 구현하는 클래스는 다음 예제와 같이 새로운 메서드 정의를 제공합니다:

**Java**
```java
/**
 * meant to be used to override the existing computeValue(String)
 * implementation in MyValueCalculator
 */
public class ReplacementComputeValue implements MethodReplacer {

    public Object reimplement(Object o, Method m, Object[] args) throws Throwable {
        // get the input value, work with it, and return a computed result
        String input = (String) args[0];
        ...
        return ...;
    }
}
```

원래 클래스를 배포하고 메서드 오버라이드를 지정하는 빈 정의는 다음 예제와 유사합니다:

```xml
<bean id="myValueCalculator" class="x.y.z.MyValueCalculator">
    <!-- arbitrary method replacement -->
    <replaced-method name="computeValue" replacer="replacementComputeValue">
        <arg-type>String</arg-type>
    </replaced-method>
</bean>

<bean id="replacementComputeValue" class="a.b.c.ReplacementComputeValue"/>
```

`<replaced-method/>` 엘리먼트 내에서 하나 이상의 `<arg-type/>` 엘리먼트를 사용하여 오버라이드되는 메서드의 메서드 시그니처를 나타낼 수 있습니다. 인수에 대한 시그니처는 메서드가 오버로드되어 클래스 내에 여러 변형이 존재하는 경우에만 필요합니다. 편의를 위해 인수의 타입 문자열은 완전한 정규화된 타입 이름의 부분 문자열일 수 있습니다. 예를 들어, 다음은 모두 `java.lang.String`과 일치합니다:

```java
java.lang.String
String
Str
```

인수의 수가 각 가능한 선택을 구별하기에 충분한 경우가 많기 때문에, 이 단축키는 인수 타입과 일치하는 가장 짧은 문자열만 입력하게 함으로써 많은 타이핑을 절약할 수 있습니다.
