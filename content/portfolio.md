---
title: "포트폴리오"
date: 2025-08-16T10:00:00+09:00
draft: false
---

# 🚀 프로젝트 포트폴리오 

---

# 개인 프로젝트 : WashFit
### 2024.01 - 2024.04 | #washfit #springboot #aws #docker #redis #postgresql
### GitHub: [https://github.com/Kernel360/F1-WashFit-BE](https://github.com/Kernel360/F1-WashFit-BE)

**세차 용품의 성분 및 안전 정보를 제공하여 사용자의 안전한 제품 선택을 돕는 웹 서비스**

### 기술 스택
- **Backend**: Java 17, Spring Boot 3.2.0, Spring Data JPA, Spring Batch
- **Database**: PostgreSQL, QueryDSL, Redis
- **Architecture**: Multi-module project (module-api, module-batch, module-domain, module-common, module-admin)

### 프로젝트 주요 기여
- **멀티 모듈 아키텍처** 설계 및 구현 (API, Batch, Domain, Common, Admin 모듈 분리)
- **Spring Batch** 모듈을 통한 데이터 처리 파이프라인 설계
- **QueryDSL**을 이용한 동적 검색 쿼리 작성으로 **복합 조건 검색 기능 구현**
- **Redis**를 활용한 캐싱 및 세션 관리

### 주요 성과

<div class="problem-cards">

#### 🔍 [QueryDSL을 활용한 동적 쿼리 및 타입 안정성 확보](/problems/washfit/querydsl-dynamic-queries/)
**컴파일 시점 오류 검증**과 **동적 쿼리 작성 용이성**을 확보하여 복잡한 검색 조건을 안전하게 처리했습니다.
*#querydsl #jpa #typesafety*

#### ⚙️ [Spring Batch 모듈 설계를 통한 데이터 처리 아키텍처 구축](/problems/washfit/spring-batch-architecture/)
**멀티 모듈 아키텍처** 내에서 **독립적인 배치 처리 시스템**을 구축하여 확장성과 유지보수성을 확보했습니다.
*#springbatch #architecture #modularity*

#### ⚡ [Redis를 활용한 캐싱 및 세션 관리 구현](/problems/washfit/redis-caching/)
**메모리 기반 캐싱**과 **분산 세션 관리**로 응답 속도 85% 향상과 확장성을 동시에 달성했습니다.
*#redis #caching #performance*

#### 🏗️ [멀티 모듈 프로젝트 아키텍처 설계 및 구현](/problems/washfit/multimodule-architecture/)
**관심사 분리**와 **독립적 배포**가 가능한 멀티 모듈 구조로 개발 효율성과 시스템 안정성을 향상시켰습니다.
*#architecture #multimodule #scalability*

</div>

---

# 개인 프로젝트 : KernelEngine
### 2023.11 - 2023.12 | #mysql #springboot #batch
### GitHub: [https://github.com/Kernel360/E2E1-KernelEngine](https://github.com/Kernel360/E2E1-KernelEngine)

**기술 블로그 게시글을 주기적으로 수집하고 키워드 검색 기능을 제공하여 정보를 효율적으로 탐색할 수 있도록 돕는 웹 서비스**

### 기술 스택
- **Backend**: Java 11, Spring Boot 2.7.17, Spring Data JPA, Spring Security, Spring Batch
- **Database**: MySQL
- **Crawling**: Jsoup (RSS 파서)
- **Frontend**: HTML5, CSS3, Thymeleaf

### 프로젝트 주요 기여
- Java/Spring 프레임워크를 이용한 **RESTful API** 설계 및 개발
- **Spring Batch**를 활용한 주기적 블로그 크롤링 시스템 구현
- **MySQL FULLTEXT**를 활용한 검색 기능 구현
- **RSS 파서**를 통한 블로그 게시글 자동 수집

### 주요 성과

<div class="problem-cards">

#### 🔍 [MySQL FULLTEXT를 활용한 효율적인 검색 기능 구현](/problems/kernelengine/mysql-fulltext-search/)
프로젝트 규모에 적합한 **MySQL FULLTEXT 인덱스** 기반 검색 시스템으로 실용적이고 확장 가능한 검색 기능을 구현했습니다.
*#search #mysql #fulltext #performance*

#### 🕷️ [RSS 파서를 활용한 블로그 크롤링 시스템 구현](/problems/kernelengine/rss-crawler-system/)
**Jsoup과 RSS 표준**을 활용한 안정적인 크롤링 시스템으로 30개 블로그에서 일평균 150개 게시글을 자동 수집했습니다.
*#crawler #rss #jsoup #automation*

#### ⚙️ [Spring Batch를 활용한 데이터 처리 및 통계 관리 시스템](/problems/kernelengine/spring-batch-data-processing/)
**청크 기반 처리**와 **오류 복구 메커니즘**을 갖춘 배치 시스템으로 대용량 데이터를 안정적으로 처리했습니다.
*#springbatch #automation #statistics*

</div>

---

#### Tags Overview
#portfolio #projects #backend #java #springboot #washfit #kernelengine #performance #optimization #redis #mysql #automation #monitoring #springbatch #etl #querydsl #multimodule #architecture #crawler #rss