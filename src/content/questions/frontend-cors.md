---
title: "CORS(Cross-Origin Resource Sharing)의 동작 원리와 해결 방법을 설명하세요"
answer: "CORS는 다른 Origin(프로토콜, 도메인, 포트가 다름)의 리소스 요청을 제한하는 브라우저 보안 정책입니다. Simple Request는 바로 전송되고, Preflight Request(OPTIONS)는 실제 요청 전에 서버 허용 여부를 확인합니다. 서버는 Access-Control-Allow-Origin 헤더로 허용 Origin을 명시해야 합니다. 해결 방법은 서버에서 CORS 헤더 설정, Proxy 서버 사용, JSONP(레거시), 또는 동일 Origin으로 배포하는 것입니다."
category: "frontend"
difficulty: 3
tags: ["CORS", "브라우저", "보안"]
source: "curated"
hints: ["Same-Origin Policy", "Preflight", "Access-Control"]
---

## 해설

Simple Request 조건:
- Method: GET, POST, HEAD
- Content-Type: application/x-www-form-urlencoded, multipart/form-data, text/plain
- 커스텀 헤더 없음

Preflight 발생:
- PUT, DELETE 등 다른 메서드
- application/json Content-Type
- 커스텀 헤더 추가

서버 설정 예시 (Spring):
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("https://example.com")
                .allowedMethods("GET", "POST")
                .allowCredentials(true);
    }
}
```
