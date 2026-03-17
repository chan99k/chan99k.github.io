---
title: "Event-Driven Architecture의 특징과 Event Sourcing의 차이를 설명하세요"
answer: "Event-Driven Architecture(EDA)는 이벤트 발행과 구독으로 컴포넌트 간 통신하며, 비동기적이고 느슨한 결합을 제공합니다. Publisher는 Subscriber를 알 필요 없이 이벤트만 발행하고, Message Broker(Kafka, RabbitMQ)가 중간에서 전달합니다. Event Sourcing은 상태 변경을 이벤트로 저장하여 모든 변경 이력을 보존하고, 현재 상태는 이벤트를 재생(replay)하여 복원합니다. EDA는 통신 방식, Event Sourcing은 저장 방식으로 목적이 다르며 함께 사용할 수 있습니다."
category: "architecture"
difficulty: 4
tags: ["이벤트", "비동기", "MSA"]
source: "curated"
hints: ["Pub-Sub", "느슨한 결합", "이벤트 재생"]
---

## 해설

EDA 장점:
- 서비스 간 결합도 감소
- 비동기로 확장성과 성능 향상
- 장애 격리

EDA 단점:
- 트랜잭션 관리 복잡(Saga 패턴 필요)
- 디버깅 어려움
- 이벤트 순서 보장 필요

Event Sourcing 장점:
- 완전한 감사(audit) 로그
- 시간 여행(특정 시점 상태 복원)
- 이벤트 기반 분석

Event Sourcing 단점:
- 저장 공간 증가
- 쿼리 복잡(CQRS와 함께 사용)
- 스키마 변경 어려움
