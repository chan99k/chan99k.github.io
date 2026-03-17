---
title: "Spring Bean의 Scope(singleton, prototype, request, session)를 설명하세요"
answer: "Singleton은 IoC 컨테이너당 하나의 인스턴스만 생성되며 기본값입니다. Prototype은 요청마다 새 인스턴스를 생성하고 컨테이너가 생명주기를 관리하지 않습니다. Request는 HTTP 요청당, Session은 HTTP 세션당 하나의 인스턴스를 생성하며 웹 애플리케이션에서만 사용 가능합니다. Singleton Bean에 Prototype Bean을 주입하면 의도와 다르게 동작할 수 있으므로 @Lookup이나 Provider를 사용해야 합니다."
category: "spring"
difficulty: 3
tags: ["Bean", "IoC", "생명주기"]
source: "curated"
hints: ["기본 scope", "생명주기 관리", "Prototype 주입 문제"]
---

## 해설

Singleton Bean에 Prototype Bean을 주입하면:
```java
@Component
public class SingletonBean {
    @Autowired
    private PrototypeBean prototypeBean;  // 한 번만 주입됨!
}
```

해결책:
```java
@Component
@Scope("prototype")
public class PrototypeBean { }

@Component
public class SingletonBean {
    @Lookup  // 호출마다 새 인스턴스 반환
    public PrototypeBean getPrototypeBean() {
        return null;  // Spring이 오버라이드
    }
}
```
