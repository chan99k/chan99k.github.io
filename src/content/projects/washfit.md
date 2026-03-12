---
title: WashFit
description: 세차 용품의 성분 및 안전 정보를 제공하여 안전한 제품 선택을 돕는 웹 서비스
pubDate: 2024-04-01
techStack:
  - Java
  - Spring Boot
  - Spring Data JPA
  - Spring Batch
  - PostgreSQL
  - QueryDSL
  - Redis
  - Docker
  - AWS
githubUrl: https://github.com/Kernel360/F1-WashFit-BE
---

공공데이터포털 API를 활용하여 약 2만개의 세차 용품 데이터를 수집·가공하는 서비스입니다.

주요 기여:
- Spring Batch로 공공데이터 수집·가공 파이프라인 구축
- QueryDSL 동적 검색 쿼리로 복합 조건 검색 구현 및 API 응답 시간 38% 개선 (748ms → 463ms)
- Docker + AWS EC2 배포 및 CI/CD 환경 구축 참여
