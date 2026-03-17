---
title: "HTTP와 HTTPS의 차이와 TLS/SSL 핸드셰이크 과정을 설명하세요"
answer: "HTTP는 평문 통신으로 중간자 공격(MITM)에 취약하고, HTTPS는 TLS/SSL로 암호화하여 보안을 제공합니다. HTTPS는 443 포트를 사용하고 인증서로 서버를 검증합니다. TLS 핸드셰이크는 클라이언트가 Client Hello를 보내고, 서버가 Server Hello와 인증서를 전송하며, 키 교환으로 대칭키를 생성하여 이후 통신을 암호화합니다. HTTP/2, HTTP/3는 HTTPS를 기본으로 요구합니다."
category: "network"
difficulty: 3
tags: ["HTTP", "보안", "TLS"]
source: "curated"
hints: ["암호화", "인증서", "핸드셰이크"]
---

## 해설

TLS 핸드셰이크 단계:
1. Client Hello: 지원 암호화 방식 전송
2. Server Hello: 선택한 암호화 방식, 인증서 전송
3. 인증서 검증: CA(Certificate Authority)로 서버 신원 확인
4. 키 교환: 공개키로 대칭키 암호화하여 전송
5. Finished: 핸드셰이크 완료, 이후 대칭키로 통신

성능 영향:
- 핸드셰이크 오버헤드(RTT 증가)
- HTTP/2는 멀티플렉싱으로 완화
- TLS 1.3은 1-RTT 핸드셰이크로 개선

HTTPS 필수화: SEO 우대, PWA 요구사항, 쿠키 Secure 플래그
