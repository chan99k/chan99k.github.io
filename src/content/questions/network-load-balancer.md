---
title: "Load Balancer의 종류(L4, L7)와 알고리즘(Round Robin, Least Connection)을 설명하세요"
answer: "L4 Load Balancer는 전송 계층(IP, Port)에서 동작하여 빠르지만 단순합니다. L7 Load Balancer는 응용 계층(HTTP 헤더, URL, 쿠키)을 해석하여 세밀한 라우팅이 가능하지만 느립니다. Round Robin은 서버를 순서대로 선택하여 간단하지만 서버 상태를 고려하지 않고, Least Connection은 연결 수가 적은 서버를 선택하여 부하를 균등하게 분산합니다. Weighted Round Robin, IP Hash, Least Response Time 등 다양한 알고리즘이 있습니다."
category: "network"
difficulty: "mid"
tags: ["로드밸런서", "트래픽 분산", "확장성"]
source: "curated"
hints: ["L4 vs L7", "라우팅 기준", "알고리즘"]
---

## 해설

L4 vs L7:
- L4: TCP/UDP 포트 기반, NAT, 빠름
- L7: HTTP 헤더/URL 기반, SSL Termination, 캐싱

알고리즘 비교:
- Round Robin: 순서대로, 서버 성능 무시
- Weighted Round Robin: 서버 성능에 가중치 부여
- Least Connection: 현재 연결 수 기반
- IP Hash: 클라이언트 IP로 해싱, 세션 유지

대표 도구:
- L4: AWS NLB, HAProxy
- L7: AWS ALB, Nginx, Envoy

Health Check: 주기적으로 서버 상태 확인하여 장애 서버 제외
