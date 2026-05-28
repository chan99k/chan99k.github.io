---
title: "이벤트 기반 모듈 간 통신 설계"
description: "Spring Modulith Event Publication과 Outbox 패턴을 활용한 모듈 간 느슨한 결합 구현"
pubDate: 2026-02-28
category: "problem"
project: "Giftify"
techStack: ["Spring Modulith", "Event Publication", "Outbox Pattern", "ApplicationEventPublisher"]
---

## 문제 상황 — 모듈 간 직접 의존성으로 인한 강결합

모듈을 분리해도 통신 방식이 잘못되면 의미가 없습니다. 예를 들자면 결제가 완료되면 펀딩 상태 업데이트, 지갑 충전, 알림 발송 등이 이어져야 하는데, PaymentService가 FundingService, WalletService, NotificationService를 직접 호출하면 결국 결제 모듈이 나머지 전부에 의존하게 됩니다.

이 구조의 문제는 두 가지. 세부 모듈 하나에 문제가 생기면 결제 트랜잭션 전체가 영향을 받고, 후속 처리(예: 알림 발송)를 추가할 때마다 결제 모듈 코드를 건드려야 합니다.

## 해결 방안 — Spring Modulith Event Publication + Outbox 패턴

ApplicationEventPublisher로 이벤트를 발행하고, 하위 모듈이 @ApplicationModuleListener로 구독하는 구조를 적용했습니다. payment 모듈은 결제 완료 시 이벤트를 발행만 하고, funding이나 notification 모듈이 각자 처리합니다. payment 입장에서는 누가 구독하는지 알 필요가 없습니다.

이벤트 유실 방지를 위해 Spring Modulith의 Event Publication을 활용했습니다. 이벤트 발행 시 event-publication 테이블에 레코드가 함께 저장되고, 리스너가 정상 처리해야 완료 처리됩니다. 처리되지 못한 이벤트는 IncompleteEventRepublisher 스케줄러가 주기적으로 재발행합니다. 정산 관련 이벤트 3건에는 @Externalized를 적용하여 향후 메시지 브로커로 전환할 수 있는 여지를 남겨뒀습니다.

## 구현 결과

- payment 모듈에서 funding·notification·settlement 모듈로의 직접 의존성 0개, 이벤트로만 통신
- 정산 관련 이벤트 3건에 @Externalized 적용, 향후 메시지 브로커 전환 가능하도록 준비
- 알림 기능 확장 시 결제 코드 변경 없이 리스너 추가만으로 대응 (NotificationEventHandler에서 10개 이벤트 구독 중)
