---
title: "Spring Boot의 Auto Configuration 동작 원리를 설명하세요"
answer: "@SpringBootApplication은 @EnableAutoConfiguration을 포함하며, 이는 spring.factories(Boot 2.x) 또는 AutoConfiguration.imports(Boot 3.x)에 정의된 설정 클래스들을 조건부로 활성화합니다. @ConditionalOnClass, @ConditionalOnMissingBean 등의 조건 어노테이션으로 classpath와 Bean 존재 여부를 검사하여 자동 구성 여부를 결정합니다. 사용자 정의 Bean이 있으면 자동 구성을 건너뛰어 커스터마이징을 허용합니다."
category: "spring"
difficulty: "mid"
tags: ["Spring Boot", "Auto Configuration", "조건부 Bean"]
source: "curated"
hints: ["spring.factories", "@Conditional", "사용자 Bean 우선"]
---

## 해설

Auto Configuration 순서:
1. @SpringBootApplication 스캔
2. spring.factories 또는 AutoConfiguration.imports 로드
3. @Conditional 조건 평가
4. 조건 만족 시 Configuration 클래스 처리
5. 사용자 정의 Bean 존재 시 자동 구성 스킵

```java
@Configuration
@ConditionalOnClass(DataSource.class)
@ConditionalOnMissingBean(DataSource.class)
public class DataSourceAutoConfiguration {
    // classpath에 DataSource 있고, 사용자 Bean 없으면 자동 구성
}
```

`spring.autoconfigure.exclude`로 특정 자동 구성 비활성화 가능
