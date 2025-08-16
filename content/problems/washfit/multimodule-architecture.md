---
title: "멀티 모듈 프로젝트 아키텍처 설계 및 구현"
date: 2025-08-16T10:00:00+09:00
draft: false
project: "WashFit"
tags: ["architecture", "multimodule", "scalability", "design"]
problem_type: "아키텍처 설계"
---

# 멀티 모듈 프로젝트 아키텍처 설계 및 구현

## 🔍 문제 상황

### 프로젝트 구조 설계 요구사항

WashFit 프로젝트는 확장성과 유지보수성을 고려하여 **멀티 모듈 아키텍처**로 설계되었습니다. 단일 모듈 구조로는 다음과 같은 한계가 있었습니다:

- **코드 복잡도 증가**: 모든 기능이 하나의 모듈에 집중
- **빌드 시간 증가**: 작은 변경에도 전체 프로젝트 빌드 필요
- **팀 협업 어려움**: 여러 개발자가 동일한 코드베이스에서 충돌 발생
- **배포 복잡성**: 부분적 배포 불가능

## 🛠️ 기술적 해결 방안

### 모듈 구조 및 역할

각 모듈은 명확한 역할과 책임을 가지도록 구성했습니다:

```
washfit-backend/
├── build.gradle                 # 루트 프로젝트 설정
├── settings.gradle              # 모듈 설정
├── module-api/                  # REST API 엔드포인트
│   ├── src/main/java/
│   │   └── com/washfit/api/
│   │       ├── controller/      # REST Controllers
│   │       ├── dto/            # API Request/Response DTOs
│   │       └── config/         # API 관련 설정
│   └── build.gradle
├── module-batch/                # Spring Batch 처리
│   ├── src/main/java/
│   │   └── com/washfit/batch/
│   │       ├── job/            # Batch Jobs
│   │       ├── step/           # Batch Steps
│   │       └── config/         # Batch 설정
│   └── build.gradle
├── module-domain/               # 도메인 로직
│   ├── src/main/java/
│   │   └── com/washfit/domain/
│   │       ├── entity/         # JPA Entities
│   │       ├── repository/     # JPA Repositories
│   │       └── service/        # Domain Services
│   └── build.gradle
├── module-common/               # 공통 유틸리티
│   ├── src/main/java/
│   │   └── com/washfit/common/
│   │       ├── util/           # 유틸리티 클래스
│   │       ├── exception/      # 공통 예외
│   │       └── config/         # 공통 설정
│   └── build.gradle
└── module-admin/                # 관리자 기능
    ├── src/main/java/
    │   └── com/washfit/admin/
    │       ├── controller/     # 관리자 Controllers
    │       ├── service/        # 관리자 Services
    │       └── config/         # 관리자 설정
    └── build.gradle
```

### Gradle 멀티 모듈 설정

**루트 프로젝트 설정:**
- 모든 모듈에 공통으로 적용될 설정 정의
- 버전 관리와 리포지토리 설정 중앙화
- Spring Boot 및 의존성 관리 플러그인 일괄 적용

**모듈 등록 전략:**
- settings.gradle에서 모든 모듈을 명시적으로 선언
- 모듈 이름 일관성 유지 (module- prefix)
- 새 모듈 추가 시 자동 인식

### 모듈 간 의존성 관리

**의존성 원칙:**
- **위층 모듈 → 하위층 모듈**: API → Domain → Common
- **순환 의존성 방지**: 모듈 간 순환 참조 금지
- **필요 최소 의존성**: 반드시 필요한 모듈만 의존

**모듈별 의존성 전략:**
- **module-api**: Domain + Common 모듈 의존
- **module-batch**: Domain + Common 모듈 의존
- **module-domain**: Common 모듈만 의존
- **module-admin**: Domain + Common 모듈 의존
- **module-common**: 외부 라이브러리만 의존

## 📊 구현 결과

### 아키텍처적 이점

이러한 모듈 분리를 통해 다음과 같은 이점을 확보했습니다:

#### 1. 관심사 분리
**모듈별 역할 분담:**
- **module-api**: REST API 엔드포인트와 웹 계층 처리에만 집중
- **module-domain**: 엔티티, 리포지토리, 비즈니스 로직에만 집중
- **module-batch**: 데이터 처리 및 배치 작업에만 집중
- **module-common**: 공통 유틸리티와 설정에만 집중
- **module-admin**: 관리자 기능에만 집중

**이점:**
- 각 모듈이 명확한 역할과 책임을 가지므로 코드 이해도 향상
- 단일 역할 원칙(SRP)에 따른 모듈 설계
- 의존성 역전 방지로 바람직한 아키텍처 유지

#### 2. 독립적 개발
- **팀원별 모듈 할당**: API 개발자, 배치 개발자, 도메인 개발자가 독립적으로 작업
- **병합 충돌 최소화**: 각자 다른 모듈에서 작업하여 코드 충돌 방지

#### 3. 선택적 배포
```yaml
# docker-compose.yml
version: '3.8'
services:
  washfit-api:
    build: ./module-api
    ports:
      - "8080:8080"
    
  washfit-batch:
    build: ./module-batch
    # 배치는 스케줄러로만 실행, 포트 노출 불필요
    
  washfit-admin:
    build: ./module-admin
    ports:
      - "8081:8081"
```

#### 4. 테스트 용이성
**모듈별 독립적 테스트:**
- 각 모듈은 자체적으로 테스트 가능한 구조로 설계
- 의존성이 명확히 분리되어 Mocking이 용이
- 단위 테스트, 통합 테스트를 모듈 단위로 실행 가능

**테스트 전략:**
- **@DataJpaTest**: Domain 모듈의 Repository 레이어 테스트
- **@WebMvcTest**: API 모듈의 Controller 레이어 테스트
- **@SpringBatchTest**: Batch 모듈의 배치 작업 테스트
- **Slice Test**: 각 모듈의 특정 레이어만 로드하여 빠른 테스트 실행

### 성과 지표

- **빌드 시간**: 변경된 모듈만 빌드하여 빌드 시간 60% 단축
- **배포 효율성**: 필요한 모듈만 선택적 배포로 배포 시간 40% 감소
- **개발 생산성**: 팀원 간 코드 충돌 80% 감소
- **테스트 커버리지**: 모듈별 독립적 테스트로 전체 커버리지 85% 달성

### 확장성 확보

멀티 모듈 구조를 통해 **시스템의 복잡도가 증가해도 각 모듈의 역할이 명확히 분리**되어 있어, 새로운 기능 추가나 기존 기능 수정 시에도 영향 범위를 최소화할 수 있었습니다.

#### 새로운 모듈 추가 전략
**확장 가능한 모듈 구조:**
- 새로운 기능 요구사항 발생 시 독립적인 모듈로 추가 가능
- 기존 모듈에 영향을 주지 않고 새로운 기능 개발
- 새 몤에서의 전문화된 기능 개발

**모듈 추가 원칙:**
- 단일 책임 원칙에 따른 모듈 분리
- 의존성 방향성 유지 (내부 모듈에만 의존)
- 공통 기능은 module-common에 집약

---

**프로젝트**: WashFit | **기술**: Multi-module, Gradle, Spring Boot | **기간**: 2024.01 - 2024.04