---
title: "Spring Framework Overview"
description: "Spring Framework는 Java 엔터프라이즈 애플리케이션 개발을 쉽게 만드는 오픈소스 프레임워크입니다. 2003년 초기 J2EE의 복잡성에 대한 응답으로 탄생했으며, 현재는 Java 17+ 기반으로 Groovy와 Kotlin도 지원합니다. 핵심은 설정 모델과 의존성 주입(Dependency Injection) 메커니즘을 포함하는 코어 컨테이너이며, 메시징, 트랜잭션 데이터, 웹(Servlet 기반 Spring MVC 및 리액티브 Spring WebFlux) 등 다양한 애플리케이션 아키텍처에 대한 지원을 제공합니다."
pubDate: "2026-03-10"
tags: ["Resources/translations/Spring/core/IoC Container"]
contentSource: "ai-assisted"
draft: false
---

# Spring Framework Overview

> 원문: [Spring Framework Overview](https://docs.spring.io/spring-framework/reference/overview.html)

## 전문 번역

Spring은 Java 엔터프라이즈 애플리케이션을 쉽게 만들 수 있도록 해줍니다. 엔터프라이즈 환경에서 Java 언어를 활용하는 데 필요한 모든 것을 제공하며, JVM 상에서 대안 언어로 Groovy와 Kotlin을 지원하고, 애플리케이션의 요구사항에 따라 다양한 종류의 아키텍처를 만들 수 있는 유연성을 갖추고 있습니다. Spring Framework 6.0부터 Spring은 Java 17+를 요구합니다.

Spring은 광범위한 애플리케이션 시나리오를 지원합니다. 대규모 엔터프라이즈에서는 애플리케이션이 오랜 시간 존재하며, 개발자가 통제할 수 없는 JDK 및 애플리케이션 서버의 업그레이드 주기에 맞춰 실행되어야 합니다. 다른 경우에는 서버가 임베디드된 단일 jar로 실행될 수 있으며, 클라우드 환경에서 실행될 수도 있습니다. 또 다른 경우에는 서버가 필요 없는 독립 실행형 애플리케이션(배치 또는 통합 워크로드 등)일 수도 있습니다.

Spring은 오픈소스입니다. 실제 세계의 다양한 사용 사례를 기반으로 지속적인 피드백을 제공하는 크고 활발한 커뮤니티를 보유하고 있습니다. 이는 Spring이 매우 긴 시간 동안 성공적으로 발전하는 데 도움이 되었습니다.

### "Spring"이 의미하는 것 (What We Mean by "Spring")

"Spring"이라는 용어는 문맥에 따라 다른 것을 의미합니다. 이는 모든 것이 시작된 Spring Framework 프로젝트 자체를 가리키는 데 사용될 수 있습니다. 시간이 지나면서 Spring Framework 위에 다른 Spring 프로젝트들이 구축되었습니다. 대부분의 경우, 사람들이 "Spring"이라고 말할 때는 전체 프로젝트 패밀리를 의미합니다. 이 참조 문서는 기초에 초점을 맞춥니다: Spring Framework 자체입니다.

Spring Framework는 모듈로 나뉩니다. 애플리케이션은 필요한 모듈을 선택할 수 있습니다. 핵심은 설정 모델(configuration model)과 의존성 주입 메커니즘(dependency injection mechanism)을 포함하는 코어 컨테이너의 모듈들입니다. 그 외에도, Spring Framework는 메시징(messaging), 트랜잭셔널 데이터 및 영속성(transactional data and persistence), 웹(web)을 포함한 다양한 애플리케이션 아키텍처에 대한 기초적인 지원을 제공합니다. 또한 Servlet 기반의 Spring MVC 웹 프레임워크와, 이와 병행하여 Spring WebFlux 리액티브 웹 프레임워크를 포함합니다.

모듈에 대한 참고사항: Spring Framework의 jar들은 모듈 경로(Java Module System)에 배포될 수 있도록 허용합니다. 모듈이 활성화된 애플리케이션에서 사용하기 위해, Spring Framework jar들은 jar 아티팩트 이름과 독립적으로 안정적인 언어 수준 모듈 이름(예: `spring.core`, `spring.context` 등)을 정의하는 `Automatic-Module-Name` 매니페스트 항목을 포함합니다. jar들은 `.` 대신 `-`를 사용하여 동일한 네이밍 패턴을 따릅니다. 예를 들어, `spring-core`와 `spring-context`입니다. 물론, Spring Framework의 jar들은 클래스패스(classpath)에서도 잘 작동합니다.

### Spring과 Spring Framework의 역사 (History of Spring and the Spring Framework)

Spring은 2003년 초기 [J2EE](https://en.wikipedia.org/wiki/Java_Platform,_Enterprise_Edition) 스펙의 복잡성에 대한 응답으로 탄생했습니다. 일부는 Java EE와 그 현대적 후속인 Jakarta EE가 Spring과 경쟁 관계에 있다고 생각하지만, 사실 이들은 상호 보완적입니다. Spring 프로그래밍 모델은 Jakarta EE 플랫폼 스펙을 전부 수용하지 않습니다. 대신, 전통적인 EE 우산에서 신중하게 선택된 개별 스펙과 통합됩니다:

- Servlet API ([JSR 340](https://www.jcp.org/en/jsr/detail?id=340))
- WebSocket API ([JSR 356](https://www.jcp.org/en/jsr/detail?id=356))
- Concurrency Utilities ([JSR 236](https://www.jcp.org/en/jsr/detail?id=236))
- JSON Binding API ([JSR 367](https://www.jcp.org/en/jsr/detail?id=367))
- Bean Validation ([JSR 303](https://www.jcp.org/en/jsr/detail?id=303))
- JPA ([JSR 338](https://www.jcp.org/en/jsr/detail?id=338))
- JMS ([JSR 914](https://www.jcp.org/en/jsr/detail?id=914))
- 필요한 경우 트랜잭션 조정을 위한 JTA/JCA 설정

Spring Framework는 또한 Dependency Injection([JSR 330](https://www.jcp.org/en/jsr/detail?id=330)) 및 Common Annotations([JSR 250](https://www.jcp.org/en/jsr/detail?id=250)) 스펙을 지원하며, 애플리케이션 개발자는 Spring Framework가 제공하는 Spring 특화 메커니즘 대신 이들을 사용하도록 선택할 수 있습니다. 원래, 이들은 공통 `javax` 패키지를 기반으로 했습니다.

Spring Framework 6.0부터, Spring은 전통적인 `javax` 패키지 대신 `jakarta` 네임스페이스를 기반으로 Jakarta EE 9 레벨(예: Servlet 5.0+, JPA 3.0+)로 업그레이드되었습니다. EE 9를 최소 요구사항으로 하고 EE 10을 이미 지원하므로, Spring은 Jakarta EE API의 추가 발전을 위한 즉시 사용 가능한 지원을 제공할 준비가 되어 있습니다. Spring Framework 6.0은 Tomcat 10.1, Jetty 11을 웹 서버로, 그리고 Hibernate ORM 6.1과 완전 호환됩니다.

시간이 지나면서, 애플리케이션 개발에서 Java/Jakarta EE의 역할은 진화했습니다. J2EE와 Spring의 초기 시절에는 애플리케이션이 애플리케이션 서버에 배포되도록 생성되었습니다. 오늘날, Spring Boot의 도움으로, 애플리케이션은 DevOps와 클라우드 친화적인 방식으로 생성되며, Servlet 컨테이너가 임베디드되어 있고 변경하기 쉽습니다. Spring Framework 5부터, WebFlux 애플리케이션은 Servlet API를 직접 사용하지 않으며 Servlet 컨테이너가 아닌 서버(예: Netty)에서 실행될 수 있습니다.

Spring은 계속 혁신하고 진화합니다. Spring Framework 외에도, Spring Boot, Spring Security, Spring Data, Spring Cloud, Spring Batch 등 다른 프로젝트들이 있습니다. 각 프로젝트는 자체 소스 코드 저장소, 이슈 트래커, 릴리스 주기를 가지고 있다는 것을 기억하는 것이 중요합니다. Spring 프로젝트의 전체 목록은 [spring.io/projects](https://spring.io/projects)를 참조하십시오.

### 설계 철학 (Design Philosophy)

프레임워크에 대해 배울 때, 그것이 무엇을 하는지뿐만 아니라 어떤 원칙을 따르는지 아는 것이 중요합니다. 다음은 Spring Framework의 지도 원칙입니다:

- **모든 레벨에서 선택권 제공 (Provide choice at every level)**: Spring은 설계 결정을 가능한 한 늦게 연기할 수 있도록 합니다. 예를 들어, 코드를 변경하지 않고 설정을 통해 영속성 제공자(persistence providers)를 전환할 수 있습니다. 다른 많은 인프라 관심사와 서드파티 API와의 통합에서도 마찬가지입니다.

- **다양한 관점 수용 (Accommodate diverse perspectives)**: Spring은 유연성을 수용하며 일을 어떻게 해야 하는지에 대해 독선적이지 않습니다. 다양한 관점으로 광범위한 애플리케이션 요구사항을 지원합니다.

- **강력한 하위 호환성 유지 (Maintain strong backward compatibility)**: Spring의 진화는 버전 간에 최소한의 중대한 변경(breaking changes)을 강제하도록 신중하게 관리되었습니다. Spring은 Spring에 의존하는 애플리케이션과 라이브러리의 유지보수를 용이하게 하기 위해 신중하게 선택된 JDK 버전과 서드파티 라이브러리 범위를 지원합니다.

- **API 디자인에 대한 관심 (Care about API design)**: Spring 팀은 직관적이며 여러 버전과 여러 해에 걸쳐 유지되는 API를 만드는 데 많은 생각과 시간을 투입합니다.

- **코드 품질에 대한 높은 기준 설정 (Set high standards for code quality)**: Spring Framework는 의미 있고, 현재적이며, 정확한 javadoc에 강한 강조점을 둡니다. 패키지 간에 순환 종속성이 없는 깨끗한 코드 구조를 주장할 수 있는 극소수의 프로젝트 중 하나입니다.

### 피드백 및 기여 (Feedback and Contributions)

how-to 질문이나 이슈 진단 또는 디버깅을 위해서는 Stack Overflow 사용을 권장합니다. Stack Overflow에서 사용할 권장 태그 목록은 [여기](https://stackoverflow.com/questions/tagged/spring+or+spring-mvc+or+spring-aop+or+spring-jdbc+or+spring-r2dbc+or+spring-transactions+or+spring-annotations+or+spring-jms+or+spring-el+or+spring-test+or+spring+or+spring-orm+or+spring-jmx+or+spring-cache+or+spring-webflux+or+spring-rsocket?tab=Newest)를 클릭하십시오. Spring Framework에 문제가 있다고 확신하거나 기능을 제안하고 싶다면, [GitHub Issues](https://github.com/spring-projects/spring-framework/issues)를 사용하십시오.

해결책이나 제안된 수정 사항이 있다면, [Github](https://github.com/spring-projects/spring-framework)에 pull request를 제출할 수 있습니다. 그러나, 가장 사소한 이슈를 제외하고는, 이슈 트래커에 티켓이 제출되어야 하며, 거기에서 논의가 이루어지고 향후 참조를 위한 기록이 남게 된다는 점을 명심하십시오.

자세한 내용은 최상위 프로젝트 페이지의 [CONTRIBUTING](https://github.com/spring-projects/spring-framework/tree/main/CONTRIBUTING.md) 가이드라인을 참조하십시오.

### 시작하기 (Getting Started)

Spring을 이제 막 시작한다면, [Spring Boot](https://spring.io/projects/spring-boot/) 기반 애플리케이션을 생성하여 Spring Framework 사용을 시작하고 싶을 것입니다. Spring Boot는 프로덕션 준비가 된 Spring 기반 애플리케이션을 빠르고(그리고 독선적인 방식으로) 생성하는 방법을 제공합니다. Spring Framework를 기반으로 하며, 설정보다 관례를 선호하고(convention over configuration), 가능한 한 빨리 시작하고 실행할 수 있도록 설계되었습니다.

[start.spring.io](https://start.spring.io/)를 사용하여 기본 프로젝트를 생성하거나, [Getting Started Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)와 같은 ["Getting Started" 가이드](https://spring.io/guides) 중 하나를 따를 수 있습니다. 이해하기 더 쉬울 뿐만 아니라, 이러한 가이드는 매우 작업 중심적이며, 대부분 Spring Boot를 기반으로 합니다. 특정 문제를 해결할 때 고려할 수 있는 Spring 포트폴리오의 다른 프로젝트들도 다룹니다.
