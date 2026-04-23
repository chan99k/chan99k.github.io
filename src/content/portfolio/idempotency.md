---
title: "결제·지갑·이벤트의 멱등성 확보"
description: "API, 도메인, 이벤트 3계층에 걸친 멱등성 설계로 중복 처리 방지"
pubDate: 2026-02-28
category: "problem"
project: "Giftify"
techStack: ["Redis", "AOP", "Custom Annotation", "Transaction Management", "Event Idempotency"]
---

## 문제 상황 — 세 가지 중복 처리 위험

결제 흐름에서 멱등성이 보장되지 않으면 세 가지 문제가 발생할 수 있었습니다.

- **API 중복 요청**: 네트워크 지연이나 사용자 재시도로 동일한 결제·주문 요청이 중복 전송되어 이중 결제 발생
- **지갑 이중 차감**: 결제 성공 후 지갑 반영 실패 시, 이벤트 재처리 과정에서 같은 정산 지급이 두 번 실행될 위험
- **이벤트 중복 소비**: Spring Modulith Event Publication이 미처리 이벤트를 재발행할 때, 이미 처리된 이벤트가 다시 실행될 가능성

## 해결 방안 — 3계층 멱등성: API · 도메인 · 이벤트

중복 처리 방지를 세 계층으로 나누어 구현했습니다.

**API 계층 (팀원과 페어 프로그래밍)**: `@Idempotent` 커스텀 어노테이션과 AOP를 조합하여, 컨트롤러 메서드에 선언적으로 멱등성을 적용할 수 있는 구조를 만들었습니다. 클라이언트가 `X-Idempotency-Key` 헤더로 멱등키를 전달하면, Redis SETNX로 키 존재 여부를 확인합니다. 처리 중인 중복 요청에는 HTTP 202, 완료된 요청에는 HTTP 200을 반환하고, 요청 본문의 SHA-256 해시 비교로 같은 멱등키에 다른 데이터가 들어오면 400으로 차단합니다.

**도메인 계층**: 결제 생성 시 `orderNumber`의 유일성을 DB에서 확인하여, 동일한 주문번호로 요청이 들어오면 기존 결제를 반환합니다. 지갑 정산 지급에서는 `referenceType + referenceId` 조합으로 중복 여부를 체크하고, `REQUIRES_NEW` 독립 트랜잭션으로 실행하여 결제 트랜잭션과 격리했습니다. Redis 장애 시에도 DB 레벨에서 중복을 막을 수 있습니다.

**이벤트 계층**: `@EventIdempotent` 어노테이션과 `EventIdempotencyAspect`를 구현하여, 도메인 이벤트의 `eventId` 기반으로 중복 소비를 차단했습니다. Spring Modulith의 `@ApplicationModuleListener`와 결합하여, 이벤트 재발행 시에도 리스너가 같은 이벤트를 두 번 처리하지 않습니다.

## 구현 결과

- Redis SETNX 기반 `@Idempotent` AOP로 주문 생성 API에 선언적 멱등성 적용
- `orderNumber` 중복 체크 + `referenceType/referenceId` 검증으로 결제·지갑 이중 처리 차단
- `@EventIdempotent`로 이벤트 재발행 시 중복 소비 방지
- k6 동시성 테스트: 동일 멱등키로 100 VU 동시 요청 시 1건만 생성, 99건 중복 응답 확인
