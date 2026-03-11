---
title: "Java의 주요 GC 알고리즘(Serial, Parallel, G1, ZGC)의 특징을 비교하세요"
answer: "Serial GC는 단일 스레드로 동작하며 소규모 애플리케이션에 적합합니다. Parallel GC는 멀티 스레드로 처리량을 높이지만 Stop-The-World 시간이 깁니다. G1 GC는 Heap을 Region으로 나눠 예측 가능한 pause time을 제공하며 Java 9+의 기본값입니다. ZGC는 대용량 Heap(수 TB)에서 10ms 이하의 극히 짧은 pause time을 보장하는 최신 GC입니다."
category: "java"
difficulty: "mid"
tags: ["GC", "JVM", "성능"]
source: "curated"
hints: ["Stop-The-World", "Region", "pause time"]
---

## 해설

선택 기준:
- Heap 크기 < 4GB: Parallel GC
- 예측 가능한 지연시간 필요: G1 GC
- 초저지연(< 10ms) 필요: ZGC (Java 15+)

G1 GC는 `-XX:MaxGCPauseMillis`로 목표 pause time을 설정할 수 있습니다. ZGC는 Concurrent GC로 대부분의 작업을 애플리케이션 스레드와 동시에 수행합니다.
