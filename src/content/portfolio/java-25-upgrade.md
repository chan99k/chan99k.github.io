---
title: "Java 21 → 25 업그레이드 결정 근거"
description: "Compact Object Headers의 성능 개선을 정량적으로 측정하여 메이저 버전 업그레이드 결정"
pubDate: 2026-02-28
category: "decision"
project: "Giftify"
techStack: ["Java 25", "JEP 519", "k6", "Prometheus", "Grafana", "JOL"]
---

## 배경

앞서 다룬 Module-Aware Flyway를 쓰려면 Spring Modulith 2.0이 필요했고, 이건 Spring Boot 4, 즉 Java 25를 요구했습니다. Flyway 하나 때문에 메이저 버전을 올리기엔 근거가 부족했습니다.

## 가설

Java 25의 Compact Object Headers(JEP 519)가 객체 헤더를 16바이트에서 8바이트로 줄인다면, GC 부담이 줄고 응답 속도도 개선될 것이다. 이를 정량적으로 측정하면 업그레이드의 근거로 쓸 수 있다.

## 실험 환경

Docker Compose 로컬 환경에서 Java 21과 Java 25를 각각 띄우고, k6로 동일한 부하 시나리오를 실행했습니다. HTTP 응답시간, GC 메트릭, Native Memory Tracking 데이터를 Prometheus로 수집하고 Grafana에서 확인했습니다. 메모리 레이아웃은 JOL 0.17로 app.giftify.* 패키지 571개 클래스를 대상으로 측정했습니다.

## 측정 결과

k6 Stress Test (100 VU):

|  | Java 21 | Java 25 | 변화 |
|---|---|---|---|
| 평균 응답시간 | 13.3ms | 6.5ms | **-51.4%** |
| p99 응답시간 | 157ms | 26ms | **-83.4%** |

GC 및 메모리:

|  | Java 21 | Java 25 | 변화 |
|---|---|---|---|
| GC 횟수 | 22회 | 4회 | **-81.8%** |
| GC 총 소요시간 | 0.53s | 0.08s | **-84.2%** |
| Native Memory | 877MB | 708MB | **-19.3%** |
| Thread Stack | 157MB | 2MB | Virtual Threads |

JOL 벤치마크 (Compact Object Headers):

|  | 기본 | Compact | 변화 |
|---|---|---|---|
| 평균 인스턴스 크기 | 29.7B | 25.8B | -13.1% |
| Record (178개) | 16B | 8B | **-50%** |
| JPA Entity (23개) | 57.7B | 52.2B | -9.5% |

\* Java 21과 Java 25 기본 모드는 바이트 단위로 동일

## 판단

가설대로 GC 횟수와 응답 시간이 크게 개선되었고, Compact Headers로 메모리 절감 효과도 확인했습니다. 이 결과를 근거로 Java 25 업그레이드를 결정하고, Compact Headers 적용을 검토했습니다.
