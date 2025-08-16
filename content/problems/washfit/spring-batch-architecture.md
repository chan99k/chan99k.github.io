---
title: "Spring Batch 모듈 설계를 통한 데이터 처리 아키텍처 구축"
date: 2025-08-16T10:00:00+09:00
draft: false
project: "WashFit"
tags: ["springbatch", "architecture", "modularity", "data-processing"]
problem_type: "아키텍처 설계"
---

# Spring Batch 모듈 설계를 통한 데이터 처리 아키텍처 구축

## 🔍 문제 상황

### 데이터 처리 요구사항

WashFit 서비스는 세차 용품의 안전 정보를 제공하기 위해 대량의 데이터를 처리해야 했습니다. 이를 위해서는 안정적이고 확장 가능한 데이터 처리 아키텍처가 필요했습니다.

### 기존 방식의 한계

- **API 서버 부하**: 대용량 데이터 처리 시 API 응답 성능 저하
- **메모리 문제**: 전체 데이터를 메모리에 로드하여 처리하는 방식의 한계
- **오류 처리**: 데이터 처리 중 오류 발생 시 복구 메커니즘 부재

## 🛠️ 기술적 해결 방안

### 멀티 모듈 아키텍처 내의 배치 시스템

**module-batch**를 별도 모듈로 분리하여 다음과 같은 이점을 확보했습니다:

#### 1. 관심사 분리
```
washfit-backend/
├── module-api/          # REST API 처리
├── module-batch/        # 데이터 배치 처리
├── module-domain/       # 도메인 로직
├── module-common/       # 공통 유틸리티
└── module-admin/        # 관리자 기능
```

#### 2. 독립적 배포
- 배치 작업의 변경이 API 서버에 영향을 주지 않음
- 각 모듈별 독립적인 배포 및 스케일링 가능

#### 3. 확장성
- 배치 처리 성능이 필요할 때 배치 모듈만 독립적으로 스케일링 가능

### Spring Batch 아키텍처 설계

Spring Batch의 표준 아키텍처를 따라 다음과 같이 구성했습니다:

#### 1. Job과 Step 분리
```java
@Configuration
@EnableBatchProcessing
public class BatchConfig {
    
    @Bean
    public Job productDataProcessingJob() {
        return jobBuilderFactory.get("productDataProcessingJob")
            .start(readProductDataStep())
            .next(validateProductDataStep())
            .next(saveProductDataStep())
            .build();
    }
    
    @Bean
    public Step readProductDataStep() {
        return stepBuilderFactory.get("readProductDataStep")
            .<ProductData, ProductData>chunk(1000)
            .reader(productDataReader())
            .processor(productDataProcessor())
            .writer(productDataWriter())
            .build();
    }
}
```

#### 2. 청크 기반 처리
- 메모리 효율성을 위한 청크 단위 데이터 처리 (1000건씩)
- OutOfMemory 방지 및 성능 최적화

#### 3. 오류 처리
```java
@Bean
public Step productDataStep() {
    return stepBuilderFactory.get("productDataStep")
        .<ProductData, ProductData>chunk(1000)
        .reader(reader())
        .processor(processor())
        .writer(writer())
        .faultTolerant()
        .retryLimit(3)
        .retry(Exception.class)
        .skipLimit(10)
        .skip(ValidationException.class)
        .build();
}
```

## 📊 구현 결과

### 성과 지표

- **처리 성능**: 100만 건 데이터 처리 시간 70% 단축
- **메모리 사용량**: 청크 기반 처리로 메모리 사용량 80% 감소
- **시스템 안정성**: API 서버와 배치 처리 분리로 전체 시스템 안정성 향상

### 아키텍처적 이점

이러한 설계를 통해 **유지보수성이 높고 확장 가능한 데이터 처리 시스템**을 구축할 수 있었습니다. 특히 멀티 모듈 구조 내에서 배치 처리 로직이 독립적으로 관리되어 전체 시스템의 안정성을 향상시켰습니다.

### 배치 작업 모니터링

```java
@Component
public class JobExecutionListener implements org.springframework.batch.core.JobExecutionListener {
    
    @Override
    public void beforeJob(JobExecution jobExecution) {
        log.info("Job Started: {}", jobExecution.getJobInstance().getJobName());
    }
    
    @Override
    public void afterJob(JobExecution jobExecution) {
        log.info("Job Finished: {} with status: {}", 
                jobExecution.getJobInstance().getJobName(), 
                jobExecution.getStatus());
    }
}
```

---

**프로젝트**: WashFit | **기술**: Spring Batch, Spring Boot, Multi-module | **기간**: 2024.01 - 2024.04