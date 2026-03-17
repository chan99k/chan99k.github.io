---
title: "API Gateway의 역할과 BFF(Backend For Frontend) 패턴을 설명하세요"
answer: "API Gateway는 클라이언트와 마이크로서비스 사이의 단일 진입점으로, 라우팅, 인증/인가, Rate Limiting, 로깅, 프로토콜 변환 등을 담당합니다. 클라이언트가 여러 서비스를 직접 호출하지 않고 Gateway를 통해 통합된 API를 제공받습니다. BFF는 각 프론트엔드(Web, Mobile, IoT) 특성에 맞춘 전용 Backend를 두는 패턴으로, 클라이언트별로 최적화된 데이터를 제공하고 불필요한 Over-fetching을 방지합니다. API Gateway는 공통 인프라, BFF는 클라이언트 특화 로직을 담당합니다."
category: "architecture"
difficulty: 3
tags: ["MSA", "API Gateway", "BFF"]
source: "curated"
hints: ["단일 진입점", "클라이언트별 최적화", "Over-fetching"]
---

## 해설

API Gateway 책임:
- Routing: /users → User Service, /orders → Order Service
- Authentication: JWT 검증
- Rate Limiting: 사용자당 1000 req/hour
- Circuit Breaking: 장애 서비스 차단
- Response Aggregation: 여러 서비스 결과 조합

BFF 패턴:
```
Mobile App → Mobile BFF → Microservices
Web App → Web BFF → Microservices
```

장점: 각 클라이언트 요구사항 독립 진화
단점: 중복 로직 발생 가능, 관리 포인트 증가

대표 도구: AWS API Gateway, Kong, Spring Cloud Gateway, Netflix Zuul
