---
title: "TCP와 UDP의 차이와 각각의 사용 사례를 설명하세요"
answer: "TCP는 연결 지향 프로토콜로 3-way 핸드셰이크로 연결을 수립하고, 순서 보장, 재전송, 흐름 제어, 혼잡 제어를 제공하여 신뢰성이 높습니다. UDP는 비연결 프로토콜로 헤더가 작고 빠르지만 순서와 도착을 보장하지 않습니다. TCP는 HTTP, HTTPS, SSH, 파일 전송 등 신뢰성이 중요한 경우에, UDP는 실시간 스트리밍, DNS, 게임 등 속도가 중요하고 일부 손실을 허용할 수 있는 경우에 사용합니다."
category: "network"
difficulty: 2
tags: ["네트워크", "프로토콜", "TCP"]
source: "curated"
hints: ["3-way 핸드셰이크", "신뢰성 vs 속도", "재전송"]
---

## 해설

TCP 3-way 핸드셰이크:
```
Client → SYN → Server
Client ← SYN+ACK ← Server
Client → ACK → Server
(연결 수립)
```

4-way 핸드셰이크 (연결 종료):
```
Client → FIN → Server
Client ← ACK ← Server
Client ← FIN ← Server
Client → ACK → Server
```

특징 비교:
- TCP: 신뢰성, 순서 보장, 느림, 무거움
- UDP: 빠름, 가벼움, 손실 가능, 실시간

최근 트렌드: QUIC(HTTP/3 기반)은 UDP 위에 TCP의 신뢰성을 구현하여 양쪽 장점 결합
