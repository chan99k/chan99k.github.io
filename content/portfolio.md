---
# 기본 페이지 정보
#title: "포트폴리오"                          # 페이지 제목 (필수)
date: 2025-08-16T10:00:00+09:00           # 게시 날짜 (YYYY-MM-DD 형식)
lastmod: 2025-08-17T15:30:00+09:00        # 마지막 수정 날짜
publishDate: 2025-08-16T10:00:00+09:00    # 게시 예약 날짜
expiryDate: 2030-12-31T23:59:59+09:00     # 만료 날짜 (이후 숨김)

# 페이지 상태
draft: false                              # 초안 여부 (true면 빌드 시 제외)
featured: false                           # 추천 게시물 여부
isCJKLanguage: true                       # CJK 언어 여부 (한/중/일 문자 처리)

# SEO 및 메타데이터
description: "프로젝트 경험과 기술적 문제 해결 과정을 소개합니다."
summary: ""  # 요약문
keywords: ["포트폴리오", "백엔드", "Java", "Spring", "프로젝트", "개발자"]  # SEO 키워드
author: "chan99k"                         # 작성자
authors: ["chan99k"]                      # 복수 작성자 (배열)

# 분류 및 태그
categories: ["portfolio", "projects"]     # 카테고리 분류
tags: ["backend", "java", "spring", "washfit", "kernelengine", "querydsl", "springbatch"]  # 태그
series: ["development-portfolio"]         # 시리즈 분류

# 페이지 표시 설정
weight: 1                                 # 페이지 정렬 순서 (낮을수록 앞)
menu: "main"                              # 메뉴 그룹
url: "/portfolio/"                        # 커스텀 URL
slug: "portfolio"                         # URL 슬러그
aliases: ["/projects/", "/work/"]         # 별칭 URL들

# 외부 링크
canonicalURL: "https://chan99k.github.io/portfolio/"  # 정규 URL
type: "page"                              # 페이지 타입
layout: "single"                          # 레이아웃 템플릿
section: "portfolio"                      # 섹션 분류

# 표시 옵션 (PaperMod 테마 전용)
hidemeta: true                            # 메타 정보 숨김 (날짜, 작성자 등)
hideSummary: true                        # 요약 숨김 여부
hideFooter: false                         # 푸터 숨김 여부
ShowReadingTime: false                    # 읽기 시간 표시 안함
ShowWordCount: false                      # 단어 수 표시 안함
ShowShareButtons: false                   # 공유 버튼 표시 안함
ShowPostNavLinks: true                    # 이전/다음 게시물 링크 표시
ShowBreadCrumbs: true                     # 브레드크럼 표시
ShowCodeCopyButtons: true                 # 코드 복사 버튼 표시
ShowToc: false                            # 목차 표시 안함
TocOpen: false                            # 목차 펼침 상태
ShowRssButtonInSectionTermList: false     # RSS 버튼 숨김
disableShare: true                        # 공유 기능 비활성화
disableHLJS: false                        # 코드 하이라이트 비활성화 여부
searchHidden: false                       # 검색에서 숨김 여부

# 댓글 설정
comments: false                           # 댓글 기능 비활성화
disableAnchoredHeadings: false            # 헤딩 앵커 비활성화
disableScrollToTop: false                 # 맨 위로 버튼 비활성화

# 커버 이미지 설정
cover:
    image: ""                             # 커버 이미지 URL
    alt: "포트폴리오 커버 이미지"              # 이미지 alt 텍스트
    caption: "백엔드 개발 프로젝트 포트폴리오"   # 이미지 캡션
    relative: false                       # 상대 경로 여부
    hidden: true                          # 커버 이미지 숨김

# Open Graph (소셜 미디어) 설정
images: ["/images/portfolio-og.jpg"]      # 소셜 미디어 미리보기 이미지

# 사용자 정의 변수
custom:
    projects_count: 2                     # 프로젝트 개수
    tech_stack: ["Java", "Spring Boot", "PostgreSQL", "MySQL", "Redis"]  # 주요 기술 스택
    featured_project: "WashFit"           # 대표 프로젝트
---

<div class="portfolio-intro">

각 프로젝트에서 마주한 **문제**와 **해결 과정**을 상세히 기록했습니다.
</div>

# 🚀 WashFit

<div class="project-header">
<div class="project-meta">
<span class="project-period">📅 2024.01 - 2024.04</span>
<span class="project-team">👥 4인 팀 프로젝트</span>
</div>
<div class="project-links">
<a href="https://github.com/Kernel360/F1-WashFit-BE" target="_blank" class="github-link">
🔗 GitHub Repository
</a>
</div>
</div>

<div class="project-tags">
<span class="tag">#washfit</span>
<span class="tag">#springboot</span>
<span class="tag">#postgresql</span>
<span class="tag">#redis</span>
<span class="tag">#docker</span>
</div>

**세차 용품의 성분 및 안전 정보를 제공하여 사용자의 안전한 제품 선택을 돕는 웹 서비스**

### ⚙️ 기술 스택
- **Backend**: Java 17, Spring Boot 3.2.0, Spring Data JPA, Spring Batch
- **Database**: PostgreSQL, QueryDSL, Redis
- **Architecture**: Multi-module project (module-api, module-batch, module-domain, module-common, module-admin)

### 🎯 프로젝트 주요 기여
- **멀티 모듈 아키텍처** 설계 및 구현 (API, Batch, Domain, Common, Admin 모듈 분리)
- **Spring Batch** 모듈을 통한 데이터 처리 파이프라인 설계
- **QueryDSL**을 이용한 동적 검색 쿼리 작성으로 **복합 조건 검색 기능 구현**
- **Redis**를 활용한 세션 관리

### 💡 마주한 문제와 해결법

<div class="problem-cards-container">
  <div class="problem-card">
    <div class="card-icon">🔍</div>
    <div class="card-content">
      <h4><a href="/problems/washfit/querydsl-dynamic-queries/">QueryDSL을 활용한 동적 쿼리 및 타입 안정성 확보</a></h4>
      <p><strong>컴파일 시점 오류 검증</strong>과 <strong>동적 쿼리 작성 용이성</strong>을 확보하여 복잡한 검색 조건을 안전하게 처리했습니다.</p>
      <div class="card-tags">
        <span class="mini-tag">querydsl</span>
        <span class="mini-tag">jpa</span>
        <span class="mini-tag">typesafety</span>
      </div>
    </div>
  </div>
  
  <div class="problem-card">
    <div class="card-icon">⚙️</div>
    <div class="card-content">
      <h4><a href="/problems/washfit/spring-batch-architecture/">Spring Batch 모듈 설계를 통한 데이터 처리 아키텍처 구축</a></h4>
      <p><strong>멀티 모듈 아키텍처</strong> 내에서 <strong>독립적인 배치 처리 시스템</strong>을 구축하여 확장성과 유지보수성을 확보했습니다.</p>
      <div class="card-tags">
        <span class="mini-tag">springbatch</span>
        <span class="mini-tag">architecture</span>
        <span class="mini-tag">modularity</span>
      </div>
    </div>
  </div>
  
  <div class="problem-card">
    <div class="card-icon">🏗️</div>
    <div class="card-content">
      <h4><a href="/problems/washfit/multimodule-architecture/">멀티 모듈 프로젝트 아키텍처 설계 및 구현</a></h4>
      <p><strong>관심사 분리</strong>와 <strong>독립적 배포</strong>가 가능한 멀티 모듈 구조로 개발 효율성과 시스템 안정성을 향상시켰습니다.</p>
      <div class="card-tags">
        <span class="mini-tag">architecture</span>
        <span class="mini-tag">multimodule</span>
        <span class="mini-tag">scalability</span>
      </div>
    </div>
  </div>
</div>

---

# 🔍 KernelEngine

<div class="project-header">
<div class="project-meta">
<span class="project-period">📅 2023.11 - 2023.12</span>
<span class="project-team">👥 3인 팀 프로젝트</span>
</div>
<div class="project-links">
<a href="https://github.com/Kernel360/E2E1-KernelEngine" target="_blank" class="github-link">
🔗 GitHub Repository
</a>
</div>
</div>

<div class="project-tags">
<span class="tag">#kernelengine</span>
<span class="tag">#springboot</span>
<span class="tag">#mysql</span>
<span class="tag">#batch</span>
<span class="tag">#crawler</span>
</div>

**기술 블로그 게시글을 주기적으로 수집하고 키워드 검색 기능을 제공하여 정보를 효율적으로 탐색할 수 있도록 돕는 웹 서비스**

### ⚙️ 기술 스택
- **Backend**: Java 11, Spring Boot 2.7.17, Spring Data JPA, Spring Security, Spring Batch
- **Database**: MySQL
- **Crawling**: Jsoup (RSS 파서)
- **Frontend**: HTML5, CSS3, Thymeleaf

### 🎯 프로젝트 주요 기여
- Java/Spring 프레임워크를 이용한 **RESTful API** 설계 및 개발
- **Spring Batch**를 활용한 주기적 블로그 크롤링 시스템 구현

### 💡 마주한 문제와 해결법

<div class="problem-cards-container">
  <div class="problem-card">
    <div class="card-icon">🔍</div>
    <div class="card-content">
      <h4><a href="/problems/kernelengine/mysql-fulltext-search/">요구사항에 걸맞는 검색 기능 구현</a></h4>
      <p>프로젝트 규모에 적합한 <strong>MySQL FULLTEXT 인덱스</strong> 기반 검색 시스템으로 확장 가능한 검색 기능을 구현했습니다.</p>
      <div class="card-tags">
        <span class="mini-tag">search</span>
        <span class="mini-tag">mysql</span>
        <span class="mini-tag">fulltext</span>
        <span class="mini-tag">performance</span>
      </div>
    </div>
  </div>
  
  <div class="problem-card">
    <div class="card-icon">⚙️</div>
    <div class="card-content">
      <h4><a href="/problems/kernelengine/spring-batch-data-processing/">Spring Batch를 활용한 데이터 처리 및 통계 관리 시스템</a></h4>
      <p><strong>청크 기반 처리</strong>와 <strong>오류 복구 메커니즘</strong>을 갖춘 배치 시스템으로 데이터를 안정적으로 처리했습니다.</p>
      <div class="card-tags">
        <span class="mini-tag">springbatch</span>
        <span class="mini-tag">automation</span>
        <span class="mini-tag">statistics</span>
      </div>
    </div>
  </div>
  
  <div class="problem-card">
    <div class="card-icon">🕷️</div>
    <div class="card-content">
      <h4><a href="/problems/kernelengine/rss-crawler-system/">RSS 파서를 활용한 블로그 크롤링 시스템 구현</a></h4>
      <p><strong>Jsoup과 RSS 표준</strong>을 활용한 안정적인 크롤링 시스템으로 블로그에서 게시글을 자동 수집했습니다.</p>
      <div class="card-tags">
        <span class="mini-tag">crawler</span>
        <span class="mini-tag">rss</span>
        <span class="mini-tag">jsoup</span>
        <span class="mini-tag">automation</span>
      </div>
    </div>
  </div>
</div>

---

#### Tags Overview
#portfolio #projects #backend #java #springboot #washfit #kernelengine #performance #optimization #redis #mysql #automation #monitoring #springbatch #etl #querydsl #multimodule #architecture #crawler #rss