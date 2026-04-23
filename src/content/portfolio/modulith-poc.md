---
title: "Spring Modulith PoC로 팀 합의 도출"
description: "작동하는 최소 스켈레톤을 하루 만에 제작하여 아키텍처 도입에 대한 팀 반대를 합의로 전환"
pubDate: 2026-02-28
category: "decision"
project: "Giftify"
techStack: ["Spring Modulith", "PoC", "ApplicationModuleTest", "Event Publication"]
---

## 배경

4인 팀이 7주간 진행하는 프로젝트에서 모듈형 아키텍처 도입을 제안했을 때, 팀원들로부터 "아키텍처까지 신경 쓸 여유가 있을까"라는 반대 의견이 나왔습니다. 추상적인 설명만으로는 실제 효용을 납득시키기 어려웠기에, 작동하는 PoC를 빠르게 제작하여 Spring Modulith의 가치를 시연하기로 했습니다.

## 검증 과정

헬스체크 엔드포인트만 포함한 최소한의 스켈레톤 애플리케이션을 하루 만에 제작했습니다. 5개의 Gradle 모듈을 구성하고, PoC를 통해 세 가지 핵심 가치를 시연했습니다. `domain`, `application`, `adapter` 하위 패키지가 internal로 처리되어 모듈 외부에서 직접 접근할 수 없다는 것, `ApplicationEventPublisher`를 통한 이벤트 기반 모듈 간 통신, `@ApplicationModuleTest`로 단일 모듈만 격리하여 부팅 가능하다는 것.

팀원들이 "프레임워크가 어떻게 이걸 가능하게 하는가"라는 질문을 제기하자, `PersistentApplicationEventMulticaster` JAR 소스 코드를 직접 분석하여 이벤트를 `event_publication` 테이블에 영속화하고 트랜잭션 커밋 후 비동기로 발행하는 내부 동작 원리를 설명했습니다.

## 결과

하루 만에 제작한 PoC를 통해 팀원들의 반대를 합의로 전환하고, Spring Modulith를 프로젝트에 적용하기로 결정하였습니다.
