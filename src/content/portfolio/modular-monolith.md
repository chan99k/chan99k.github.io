---
title: "Modular Monolith 도입과 DB 스키마 관리"
description: "Spring Modulith를 활용한 도메인 구조화와 Module-Aware Flyway를 통한 DB 스키마 모듈화"
pubDate: 2026-02-28
category: "problem"
project: "Giftify"
techStack: ["Spring Modulith", "Flyway", "PostgreSQL", "Gradle"]
---

## 문제 상황 — 복잡한 도메인 구조화와 DB 스키마 관리

Giftify는 core, member, catalog, settlement, notification 5개의 Gradle 모듈로 구성되며, 각 모듈 안에 Spring Modulith 기반의 서브 도메인이 존재합니다. 예를 들어 core 모듈 안에는 펀딩, 주문, 결제, 지갑이라는 서로 다른 관심사가 공존합니다.

부트캠프 커리큘럼에 MSA가 포함되어 있어 고민하긴 했지만, 팀원 4명이 감당하기에는 현실적으로 어렵다고 판단하였습니다. 다만, 구분없이 한 곳에서 마구 개발하다보면 시간이 지날수록 의존성이 뒤엉켜 수정이 어려워질 것이라 생각이 들었습니다.

또한 Flyway 마이그레이션이 단일 디렉토리(`db/migration/`)에 23개 파일이 시간순으로 혼재하고 있어, 팀원 간 버전 번호 충돌이 빈번하고, 특정 테이블의 현재 상태를 파악하려면 여러 파일을 추적해야 했습니다.

## 해결 방안 — Spring Modulith 기반 코드 + DB 통합 모듈화

팀에 Modular Monolith 도입을 제안하고, 논의를 거쳐 Spring Modulith를 채택했습니다. 핵심 결정은 두 가지였습니다.

첫째, **논리적 분리와 물리적 통합의 균형**입니다. 서브 도메인 단위로 논리적 모듈 경계를 설정하되, 5개 Gradle 모듈로 묶어 관리 비용을 최소화했습니다.

```
bc/member (Gradle)   -> auth, member, friendship (Spring Modulith)
bc/catalog (Gradle)  -> product, wishlist, cart (Spring Modulith)
bc/core (Gradle)     -> funding, order, payment, wallet (Spring Modulith)
bc/settlement        -> settlement (Spring Modulith)
bc/notification      -> notification (Spring Modulith)
```

둘째, 각 서브 도메인이 자체 domain/application/adapter 계층을 갖는 Hexagonal 구조를 적용하여, API 호출 기반(wallet)과 이벤트 기반(payment) 모듈의 책임을 명확히 분리했습니다.

코드를 모듈로 나눈 뒤, DB 스키마도 모듈 단위로 분리했습니다. Spring Modulith 2.0의 Module-Aware Flyway를 도입하여 `spring.modulith.runtime.flyway-enabled=true` 설정 한 줄로 모듈별 독립 Flyway 인스턴스가 구성됩니다. 기존 23개 마이그레이션 파일을 모듈별 init.sql로 정리했고, 인프라 테이블(Spring Batch, Event Publication)은 root 디렉토리에 넣어 먼저 실행되도록 했습니다.

## 구현 결과

- 전역 마이그레이션 23개 파일을 5개 모듈별 init.sql로 재구성, 팀원 간 Flyway 버전 번호 충돌 해소
- 모듈 경계 설정으로 도메인 간 직접 참조를 차단, 이벤트 기반 통신으로 전환하는 기반 마련
