---
title: "Dependencies and Configuration in Detail"
description: "이 문서는 Spring Framework의 IoC 컨테이너에서 빈(bean)의 속성과 생성자 인자를 구성하는 다양한 XML 설정 방법을 다룹니다. 기본 값(primitive, String 등)부터 복잡한 객체 참조, 컬렉션, 중첩된 빈까지 상세히 설명합니다. XML 기반 설정의 각 요소(`<property/>`, `<constructor-arg/>`, `<ref/>`, `<idref/>` 등)의 역할과 활용법을 예제와 함께 제시하며, p-namespace와 c-namespace를 활용한 간결한 설정 방법도 소개합니다."
pubDate: "2026-03-10"
tags: ["Resources/translations/Spring/IoC Container"]
contentSource: "ai-assisted"
draft: false
---

# Dependencies and Configuration in Detail

> 원문: [Dependencies and Configuration in Detail](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-properties-detailed.html)

## 전문 번역

### Straight Values (Primitives, Strings, and so on)

`<property/>` 요소의 `value` 속성은 프로퍼티 또는 생성자 인자를 사람이 읽을 수 있는 문자열 표현으로 지정합니다. Spring의 conversion service는 이러한 값을 `String`에서 프로퍼티 또는 인자의 실제 타입으로 변환하는 데 사용됩니다. 다음 예제는 다양한 값이 설정되는 것을 보여줍니다:

```xml
<bean id="myDataSource" class="org.apache.commons.dbcp.BasicDataSource" destroy-method="close">
	<!-- results in a setDriverClassName(String) call -->
	<property name="driverClassName" value="com.mysql.jdbc.Driver"/>
	<property name="url" value="jdbc:mysql://localhost:3306/mydb"/>
	<property name="username" value="root"/>
	<property name="password" value="misterkaoli"/>
</bean>
```

다음 예제는 더욱 간결한 XML 설정을 위해 p-namespace를 사용합니다:

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:p="http://www.springframework.org/schema/p"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
	https://www.springframework.org/schema/beans/spring-beans.xsd">

	<bean id="myDataSource" class="org.apache.commons.dbcp.BasicDataSource"
		destroy-method="close"
		p:driverClassName="com.mysql.jdbc.Driver"
		p:url="jdbc:mysql://localhost:3306/mydb"
		p:username="root"
		p:password="misterkaoli"/>

</beans>
```

위의 XML이 더 간결합니다. 그러나 오타는 빈 정의를 생성할 때 자동 프로퍼티 완성을 지원하는 IDE(IntelliJ IDEA 또는 Spring Tools 등)를 사용하지 않는 한 설계 시점이 아닌 런타임에 발견됩니다. 이러한 IDE 지원을 적극 권장합니다.

다음과 같이 `java.util.Properties` 인스턴스도 설정할 수 있습니다:

```xml
<bean id="mappings"
	class="org.springframework.context.support.PropertySourcesPlaceholderConfigurer">

	<!-- typed as a java.util.Properties -->
	<property name="properties">
		<value>
			jdbc.driver.className=com.mysql.jdbc.Driver
			jdbc.url=jdbc:mysql://localhost:3306/mydb
		</value>
	</property>
</bean>
```

Spring 컨테이너는 JavaBeans `PropertyEditor` 메커니즘을 사용하여 `<value/>` 요소 내부의 텍스트를 `java.util.Properties` 인스턴스로 변환합니다. 이는 유용한 단축 표현이며, Spring 팀이 `value` 속성 스타일보다 중첩된 `<value/>` 요소의 사용을 선호하는 몇 가지 경우 중 하나입니다.

#### The `idref` element

`idref` 요소는 컨테이너 내 다른 빈의 `id`(문자열 값 - 참조가 아님)를 `<constructor-arg/>` 또는 `<property/>` 요소로 전달하는 오류 방지 방법입니다. 다음 예제는 사용 방법을 보여줍니다:

```xml
<bean id="collaborator" class="..." />

<bean id="client" class="...">
	<property name="targetName">
		<idref bean="collaborator" />
	</property>
</bean>
```

위의 빈 정의 스니펫은 런타임에 다음 스니펫과 정확히 동등합니다:

```xml
<bean id="collaborator" class="..." />

<bean id="client" class="...">
	<property name="targetName" value="collaborator" />
</bean>
```

첫 번째 형식이 두 번째보다 선호되는데, `idref` 태그를 사용하면 컨테이너가 배포 시점에 참조된 이름의 빈이 실제로 존재하는지 검증할 수 있기 때문입니다. 두 번째 변형에서는 `client` 빈의 `targetName` 프로퍼티로 전달되는 값에 대한 검증이 수행되지 않습니다. 따라서 오타는 `client` 빈이 실제로 인스턴스화될 때만 발견됩니다(치명적인 결과를 초래할 가능성이 높음). `client` 빈이 prototype 빈인 경우, 이 오타와 그에 따른 예외는 컨테이너가 배포된 후 한참 후에야 발견될 수 있습니다.

> `<idref/>` 요소가 가치를 제공하는 일반적인 장소(최소한 Spring 2.0 이전 버전에서)는 `ProxyFactoryBean` 빈 정의에서 AOP 인터셉터 설정입니다. 인터셉터 이름을 지정할 때 `<idref/>` 요소를 사용하면 인터셉터 ID의 철자 오류를 방지할 수 있습니다.

### References to Other Beans (Collaborators)

`ref` 요소는 `<constructor-arg/>` 또는 `<property/>` 정의 요소 내부의 마지막 요소입니다. 여기서는 빈의 지정된 프로퍼티 값을 컨테이너가 관리하는 다른 빈(협력자)에 대한 참조로 설정합니다. 참조된 빈은 프로퍼티가 설정될 빈의 의존성이며, 프로퍼티가 설정되기 전에 필요에 따라 주문형으로 초기화됩니다. (협력자가 싱글톤 빈인 경우, 컨테이너에 의해 이미 초기화되었을 수 있습니다.) 모든 참조는 궁극적으로 다른 객체에 대한 참조입니다. 스코핑(scoping)과 검증(validation)은 `bean` 또는 `parent` 속성을 통해 다른 객체의 ID 또는 이름을 지정하는지 여부에 따라 달라집니다.

`<ref/>` 태그의 `bean` 속성을 통해 대상 빈을 지정하는 것이 가장 일반적인 형식이며, 같은 XML 파일에 있는지 여부와 관계없이 같은 컨테이너 또는 부모 컨테이너의 모든 빈에 대한 참조를 생성할 수 있습니다. `bean` 속성의 값은 대상 빈의 `id` 속성과 같거나 대상 빈의 `name` 속성 값 중 하나와 같을 수 있습니다. 다음 예제는 `ref` 요소를 사용하는 방법을 보여줍니다:

```xml
<ref bean="someBean"/>
```

`parent` 속성을 통해 대상 빈을 지정하면 현재 컨테이너의 부모 컨테이너에 있는 빈에 대한 참조가 생성됩니다. `parent` 속성의 값은 대상 빈의 `id` 속성 또는 `name` 속성의 값 중 하나와 같을 수 있습니다. 대상 빈은 현재 컨테이너의 부모 컨테이너에 있어야 합니다. 이 빈 참조 변형은 주로 컨테이너의 계층 구조가 있고 부모 빈과 같은 이름을 가진 프록시로 부모 컨테이너의 기존 빈을 래핑하려는 경우에 사용해야 합니다. 다음 리스팅 쌍은 `parent` 속성을 사용하는 방법을 보여줍니다:

```xml
<!-- in the parent context -->
<bean id="accountService" class="com.something.SimpleAccountService">
	<!-- insert dependencies as required here -->
</bean>
```

```xml
<!-- in the child (descendant) context, bean name is the same as the parent bean -->
<bean id="accountService"
	class="org.springframework.aop.framework.ProxyFactoryBean">
	<property name="target">
		<ref parent="accountService"/> <!-- notice how we refer to the parent bean -->
	</property>
	<!-- insert other configuration and dependencies as required here -->
</bean>
```

> `ref` 요소의 `local` 속성은 4.0 beans XSD에서 더 이상 지원되지 않습니다. 일반 `bean` 참조보다 더 이상 가치를 제공하지 않기 때문입니다. 4.0 스키마로 업그레이드할 때 기존 `ref local` 참조를 `ref bean`으로 변경하십시오.

### Inner Beans

`<property/>` 또는 `<constructor-arg/>` 요소 내부의 `<bean/>` 요소는 내부 빈을 정의합니다. 다음 예제를 참조하십시오:

```xml
<bean id="outer" class="...">
	<!-- instead of using a reference to a target bean, simply define the target bean inline -->
	<property name="target">
		<bean class="com.example.Person"> <!-- this is the inner bean -->
			<property name="name" value="Fiona Apple"/>
			<property name="age" value="25"/>
		</bean>
	</property>
</bean>
```

내부 빈 정의에는 정의된 ID나 이름이 필요하지 않습니다. 지정되더라도 컨테이너는 그러한 값을 식별자로 사용하지 않습니다. 컨테이너는 또한 생성 시 scope 플래그를 무시하는데, 내부 빈은 항상 익명이며 항상 외부 빈과 함께 생성되기 때문입니다. 내부 빈을 독립적으로 액세스하거나 외부 빈이 아닌 다른 협력 빈에 주입하는 것은 불가능합니다.

코너 케이스로, 사용자 정의 스코프에서 destruction callbacks를 받을 수 있습니다. 예를 들어 싱글톤 빈 내에 포함된 request-scoped 내부 빈의 경우입니다. 내부 빈 인스턴스의 생성은 포함하는 빈과 연결되어 있지만, destruction callbacks는 request scope의 라이프사이클에 참여할 수 있게 합니다. 이것은 일반적인 시나리오가 아닙니다. 내부 빈은 일반적으로 단순히 포함하는 빈의 스코프를 공유합니다.

### Collections

`<list/>`, `<set/>`, `<map/>`, 그리고 `<props/>` 요소는 각각 Java `Collection` 타입인 `List`, `Set`, `Map`, 그리고 `Properties`의 프로퍼티와 인자를 설정합니다. 다음 예제는 이들을 사용하는 방법을 보여줍니다:

```xml
<bean id="moreComplexObject" class="example.ComplexObject">
	<!-- results in a setAdminEmails(java.util.Properties) call -->
	<property name="adminEmails">
		<props>
			<prop key="administrator">administrator@example.org</prop>
			<prop key="support">support@example.org</prop>
			<prop key="development">development@example.org</prop>
		</props>
	</property>
	<!-- results in a setSomeList(java.util.List) call -->
	<property name="someList">
		<list>
			<value>a list element followed by a reference</value>
			<ref bean="myDataSource" />
		</list>
	</property>
	<!-- results in a setSomeMap(java.util.Map) call -->
	<property name="someMap">
		<map>
			<entry key="an entry" value="just some string"/>
			<entry key="a ref" value-ref="myDataSource"/>
		</map>
	</property>
	<!-- results in a setSomeSet(java.util.Set) call -->
	<property name="someSet">
		<set>
			<value>just some string</value>
			<ref bean="myDataSource" />
		</set>
	</property>
</bean>
```

맵 키(map key) 또는 값(value), 또는 집합 값(set value)의 값은 다음 요소 중 하나일 수도 있습니다:

```
bean | ref | idref | list | set | map | props | value | null
```

#### Collection Merging

Spring 컨테이너는 컬렉션 병합도 지원합니다. 애플리케이션 개발자는 부모 `<list/>`, `<map/>`, `<set/>` 또는 `<props/>` 요소를 정의하고, 자식 `<list/>`, `<map/>`, `<set/>` 또는 `<props/>` 요소가 부모 컬렉션의 값을 상속하고 재정의하도록 할 수 있습니다. 즉, 자식 컬렉션의 값은 부모와 자식 컬렉션의 요소를 병합한 결과이며, 자식의 컬렉션 요소가 부모 컬렉션에 지정된 값을 재정의합니다.

병합에 관한 이 섹션은 부모-자식 빈 메커니즘을 논의합니다. 부모 및 자식 빈 정의에 익숙하지 않은 독자는 계속하기 전에 관련 섹션을 읽기를 권장합니다.

다음 예제는 컬렉션 병합을 보여줍니다:

```xml
<beans>
	<bean id="parent" abstract="true" class="example.ComplexObject">
		<property name="adminEmails">
			<props>
				<prop key="administrator">administrator@example.com</prop>
				<prop key="support">support@example.com</prop>
			</props>
		</property>
	</bean>
	<bean id="child" parent="parent">
		<property name="adminEmails">
			<!-- the merge is specified on the child collection definition -->
			<props merge="true">
				<prop key="sales">sales@example.com</prop>
				<prop key="support">support@example.co.uk</prop>
			</props>
		</property>
	</bean>
<beans>
```

자식 빈 정의의 `adminEmails` 프로퍼티의 `<props/>` 요소에서 `merge=true` 속성의 사용에 주목하십시오. 자식 빈이 컨테이너에 의해 해석되고 인스턴스화될 때, 결과 인스턴스는 자식의 `adminEmails` 컬렉션과 부모의 `adminEmails` 컬렉션을 병합한 결과를 포함하는 `adminEmails` `Properties` 컬렉션을 갖습니다. 다음 리스팅은 결과를 보여줍니다:

```
administrator=administrator@example.com
sales=sales@example.com
support=support@example.co.uk
```

자식 `Properties` 컬렉션의 값 세트는 부모 `<props/>`의 모든 프로퍼티 요소를 상속하며, 자식의 `support` 값이 부모 컬렉션의 값을 재정의합니다.

이 병합 동작은 `<list/>`, `<map/>`, 그리고 `<set/>` 컬렉션 타입에 유사하게 적용됩니다. `<list/>` 요소의 특정 경우, `List` 컬렉션 타입과 관련된 의미론(즉, 순서가 있는 값 컬렉션이라는 개념)이 유지됩니다. 부모의 값은 모든 자식 리스트의 값보다 앞에 옵니다. `Map`, `Set`, 그리고 `Properties` 컬렉션 타입의 경우 순서가 존재하지 않습니다. 따라서 컨테이너가 내부적으로 사용하는 연관된 `Map`, `Set`, 그리고 `Properties` 구현 타입의 기반이 되는 컬렉션 타입에 대해서는 순서 의미론이 적용되지 않습니다.

#### Limitations of Collection Merging

서로 다른 컬렉션 타입(예: `Map`과 `List`)은 병합할 수 없습니다. 병합을 시도하면 적절한 `Exception`이 발생합니다. `merge` 속성은 하위의 상속된 자식 정의에 지정되어야 합니다. 부모 컬렉션 정의에 `merge` 속성을 지정하는 것은 불필요하며 원하는 병합을 초래하지 않습니다.

#### Strongly-typed collection

Java의 제네릭 타입 지원 덕분에 강타입 컬렉션을 사용할 수 있습니다. 즉, (예를 들어) `String` 요소만 포함할 수 있도록 `Collection` 타입을 선언하는 것이 가능합니다. Spring을 사용하여 강타입 `Collection`을 빈에 의존성 주입하면 Spring의 타입 변환 지원을 활용할 수 있으므로 강타입 `Collection` 인스턴스의 요소가 `Collection`에 추가되기 전에 적절한 타입으로 변환됩니다. 다음 Java 클래스와 빈 정의는 이를 수행하는 방법을 보여줍니다:

Java:
```java
public class SomeClass {

	private Map<String, Float> accounts;

	public void setAccounts(Map<String, Float> accounts) {
		this.accounts = accounts;
	}
}
```

Kotlin:
```kotlin
class SomeClass {
	lateinit var accounts: Map<String, Float>
}
```

```xml

```xml
<beans>
	<bean id="something" class="x.y.SomeClass">
		<property name="accounts">
			<map>
				<entry key="one" value="9.99"/>
				<entry key="two" value="2.75"/>
				<entry key="six" value="3.99"/>
			</map>
		</property>
	</bean>
</beans>
```

`something` 빈의 `accounts` 프로퍼티가 주입을 위해 준비될 때, 강타입 `Map<String, Float>`의 요소 타입에 대한 제네릭 정보는 리플렉션(reflection)을 통해 사용 가능합니다. 따라서 Spring의 타입 변환 인프라는 다양한 값 요소를 `Float` 타입으로 인식하고, 문자열 값(`9.99`, `2.75`, 그리고 `3.99`)이 실제 `Float` 타입으로 변환됩니다.

### Null and Empty String Values

Spring은 프로퍼티 등에 대한 빈 인자를 빈 `String`으로 처리합니다. 다음 XML 기반 설정 메타데이터 스니펫은 `email` 프로퍼티를 빈 `String` 값(`""`)으로 설정합니다.

```xml
<bean class="ExampleBean">
	<property name="email" value=""/>
</bean>
```

앞의 예제는 다음 Java 코드와 동일합니다:

Java:
```java
exampleBean.setEmail("");
```

Kotlin:
```kotlin
exampleBean.email = ""
```

`<null/>` 요소는 `null` 값을 처리합니다. 다음 리스팅은 예제를 보여줍니다:

```xml
<bean class="ExampleBean">
	<property name="email">
		<null/>
	</property>
</bean>
```

앞의 구성은 다음 Java 코드와 동일합니다:

Java:
```java
exampleBean.setEmail(null);
```

Kotlin:
```kotlin
exampleBean.email = null
```

### XML Shortcut with the p-namespace

p-namespace를 사용하면 중첩된 `<property/>` 요소 대신 `bean` 요소의 속성을 사용하여 프로퍼티 값과 협력 빈(또는 둘 다)을 설명할 수 있습니다.

Spring은 네임스페이스가 있는 확장 가능한 설정 형식을 지원하며, 이는 XML 스키마 정의를 기반으로 합니다. 이 장에서 논의된 `beans` 설정 형식은 XML 스키마 문서에 정의되어 있습니다. 그러나 p-namespace는 XSD 파일에 정의되지 않고 Spring의 코어에만 존재합니다.

다음 예제는 동일한 결과로 해석되는 두 개의 XML 스니펫(첫 번째는 표준 XML 형식을 사용하고 두 번째는 p-namespace를 사용)을 보여줍니다:

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:p="http://www.springframework.org/schema/p"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
		https://www.springframework.org/schema/beans/spring-beans.xsd">

	<bean name="classic" class="com.example.ExampleBean">
		<property name="email" value="[email protected]"/>
	</bean>

	<bean name="p-namespace" class="com.example.ExampleBean"
		p:email="[email protected]"/>
</beans>
```

이 예제는 빈 정의에서 `email`이라는 p-namespace의 속성을 보여줍니다. 이것은 Spring에게 프로퍼티 선언을 포함하도록 지시합니다. 앞서 언급했듯이, p-namespace에는 스키마 정의가 없으므로 속성 이름을 프로퍼티 이름으로 설정할 수 있습니다.

다음 예제는 다른 빈에 대한 참조를 모두 가진 두 개의 빈 정의를 포함합니다:

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:p="http://www.springframework.org/schema/p"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
		https://www.springframework.org/schema/beans/spring-beans.xsd">

	<bean name="john-classic" class="com.example.Person">
		<property name="name" value="John Doe"/>
		<property name="spouse" ref="jane"/>
	</bean>

	<bean name="john-modern"
		class="com.example.Person"
		p:name="John Doe"
		p:spouse-ref="jane"/>

	<bean name="jane" class="com.example.Person">
		<property name="name" value="Jane Doe"/>
	</bean>
</beans>
```

이 예제는 p-namespace를 사용한 프로퍼티 값뿐만 아니라 프로퍼티 참조를 선언하는 특수 형식도 사용합니다. 첫 번째 빈 정의가 `<property name="spouse" ref="jane"/>`을 사용하여 빈 `john`에서 빈 `jane`으로의 참조를 생성하는 반면, 두 번째 빈 정의는 `p:spouse-ref="jane"`을 속성으로 사용하여 정확히 같은 작업을 수행합니다. 이 경우 `spouse`는 프로퍼티 이름이고, `-ref` 부분은 이것이 직접 값이 아니라 다른 빈에 대한 참조임을 나타냅니다.

> p-namespace는 표준 XML 형식만큼 유연하지 않습니다. 예를 들어, 프로퍼티 참조를 선언하는 형식은 `Ref`로 끝나는 프로퍼티와 충돌하는 반면, 표준 XML 형식은 그렇지 않습니다. 접근법을 신중하게 선택하고 이를 팀 구성원에게 전달하여 세 가지 접근법을 모두 동시에 사용하는 XML 문서를 생성하지 않도록 하는 것이 좋습니다.

### XML Shortcut with the c-namespace

p-namespace를 사용한 XML 단축 표현과 유사하게, Spring 3.1에 도입된 c-namespace는 중첩된 `constructor-arg` 요소보다는 생성자 인자를 설정하기 위한 인라인 속성을 허용합니다.

다음 예제는 Constructor-based Dependency Injection의 예제와 같은 작업을 수행하기 위해 `c:` namespace를 사용합니다:

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:c="http://www.springframework.org/schema/c"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
		https://www.springframework.org/schema/beans/spring-beans.xsd">

	<bean id="beanTwo" class="x.y.ThingTwo"/>
	<bean id="beanThree" class="x.y.ThingThree"/>

	<!-- traditional declaration with optional argument names -->
	<bean id="beanOne" class="x.y.ThingOne">
		<constructor-arg name="thingTwo" ref="beanTwo"/>
		<constructor-arg name="thingThree" ref="beanThree"/>
		<constructor-arg name="email" value="[email protected]"/>
	</bean>

	<!-- c-namespace declaration with argument names -->
	<bean id="beanOne" class="x.y.ThingOne" c:thingTwo-ref="beanTwo"
		c:thingThree-ref="beanThree" c:email="[email protected]"/>

</beans>
```

`c:` namespace는 `p:` namespace와 동일한 규칙을 사용합니다(빈 참조를 위한 `-ref` 접미사 포함). 생성자 인자를 이름으로 설정합니다. 마찬가지로, XSD 스키마에 정의되어 있지 않더라도(Spring 코어 내부에 존재함) XML 파일에 선언되어야 합니다.

생성자 인자 이름을 사용할 수 없는 드문 경우(일반적으로 바이트코드가 `-parameters` 플래그 없이 컴파일된 경우)에는 다음과 같이 인자 인덱스로 대체할 수 있습니다:

```xml
<!-- c-namespace index declaration -->
<bean id="beanOne" class="x.y.ThingOne" c:_0-ref="beanTwo" c:_1-ref="beanThree"
	c:_2="[email protected]"/>
```

> XML 문법으로 인해, 인덱스 표기법은 선행 `_`의 존재를 요구합니다. XML 속성 이름은 숫자로 시작할 수 없기 때문입니다(일부 IDE는 허용하지만). 해당 인덱스 표기법은 `<constructor-arg>` 요소에도 사용할 수 있지만, 선언의 일반적인 순서가 일반적으로 충분하기 때문에 일반적으로 사용되지 않습니다.

실제로 생성자 해석 메커니즘은 인자 매칭에 매우 효율적이므로, 정말 필요한 경우가 아니라면 설정 전체에서 이름 표기법을 사용하는 것이 좋습니다.

### Compound Property Names

경로의 최종 프로퍼티 이름을 제외한 모든 경로 구성 요소가 `null`이 아닌 한, 빈 프로퍼티를 설정할 때 복합 또는 중첩된 프로퍼티 이름을 사용할 수 있습니다. 다음 빈 정의를 고려하십시오:

```xml
<bean id="something" class="things.ThingOne">
	<property name="fred.bob.sammy" value="123" />
</bean>
```

`something` 빈은 `fred` 프로퍼티를 가지고 있으며, 이는 `bob` 프로퍼티를 가지고 있고, 이는 `sammy` 프로퍼티를 가지고 있으며, 그 최종 `sammy` 프로퍼티가 값 `123`으로 설정되고 있습니다. 이것이 작동하려면, 빈이 생성된 후 `something`의 `fred` 프로퍼티와 `fred`의 `bob` 프로퍼티가 `null`이 아니어야 합니다. 그렇지 않으면 `NullPointerException`이 발생합니다.
