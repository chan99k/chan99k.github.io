---
title: "Spring AOP의 JDK Dynamic Proxy와 CGLIB의 차이를 설명하세요"
answer: "JDK Dynamic Proxy는 인터페이스 기반으로 동작하며 리플렉션을 사용합니다. 타겟 클래스가 인터페이스를 구현해야 하며, 인터페이스 메서드만 프록시됩니다. CGLIB는 바이트코드 조작으로 클래스를 상속하여 프록시를 생성하므로 인터페이스 없이도 동작합니다. Spring Boot 2.0+부터는 CGLIB가 기본값이며, final 클래스/메서드는 프록시할 수 없습니다."
category: "spring"
difficulty: 3
tags: ["AOP", "프록시", "바이트코드"]
source: "curated"
hints: ["인터페이스 필요성", "상속 vs 리플렉션", "final 제약"]
---

## 해설

@Transactional이 같은 클래스 내부 메서드 호출에서 동작하지 않는 이유:
```java
public class UserService {
    public void outerMethod() {
        this.innerMethod();  // 프록시를 거치지 않음!
    }

    @Transactional
    public void innerMethod() {
        // 트랜잭션이 적용되지 않음
    }
}
```

해결책: 별도 Bean으로 분리하거나 AopContext.currentProxy() 사용
