---
title: "Core Technologies"
description: "이 문서는 Spring Framework에 절대적으로 필수적인 모든 핵심 기술들을 다룹니다. 가장 중요한 것은 Spring Framework의 제어 역전(Inversion of Control, IoC) 컨테이너이며, 이어서 Spring의 관점 지향 프로그래밍(Aspect-Oriented Programming, AOP) 기술에 대한 포괄적인 설명이 제공됩니다. Spring Framework는 개념적으로 이해하기 쉬우면서도 Java 엔터프라이즈 프로그래밍의 AOP 요구사항 중 80%의 스위트 스팟을 성공적으로 처리하는 자체 AOP 프레임워크를 가지고 있습니다."
pubDate: "2026-03-10"
tags: ["Resources/translations/Spring/core/IoC Container"]
contentSource: "ai-assisted"
draft: false
---

# Core Technologies

> 원문: [Core Technologies](https://docs.spring.io/spring-framework/reference/core.html)

## 전문 번역

### Core Technologies (핵심 기술)

참조 문서의 이 부분은 Spring Framework에 절대적으로 필수적인 모든 기술들을 다룹니다.

이들 중 가장 중요한 것은 Spring Framework의 제어 역전(Inversion of Control, IoC) 컨테이너입니다. Spring Framework의 IoC 컨테이너에 대한 철저한 처리 다음에는 Spring의 관점 지향 프로그래밍(Aspect-Oriented Programming, AOP) 기술에 대한 포괄적인 설명이 이어집니다. Spring Framework는 개념적으로 이해하기 쉬우면서도 Java 엔터프라이즈 프로그래밍의 AOP 요구사항 중 80%의 스위트 스팟을 성공적으로 처리하는 자체 AOP 프레임워크를 가지고 있습니다.

Spring과 AspectJ의 통합(현재 기능 면에서 가장 풍부하고, 확실히 Java 엔터프라이즈 영역에서 가장 성숙한 AOP 구현체)에 대한 설명도 제공됩니다.

AOT 처리(Ahead-of-Time processing)를 사용하여 애플리케이션을 사전에 최적화할 수 있습니다. 이는 일반적으로 GraalVM을 사용한 네이티브 이미지 배포(native image deployment)에 사용됩니다.

### 핵심 기술 주요 섹션

이 Core Technologies 부분은 다음과 같은 주요 섹션들로 구성됩니다:

1. **The IoC Container (IoC 컨테이너)**: Spring의 의존성 주입(Dependency Injection) 메커니즘과 빈(Bean) 관리

2. **Resources (리소스)**: 애플리케이션 리소스 접근 및 관리

3. **Validation, Data Binding, and Type Conversion (검증, 데이터 바인딩, 타입 변환)**: 데이터 검증 및 바인딩 메커니즘

4. **Spring Expression Language (SpEL)**: 런타임에 객체 그래프 조회 및 조작을 위한 표현 언어

5. **Aspect Oriented Programming with Spring (Spring을 사용한 관점 지향 프로그래밍)**: Spring AOP의 개념과 사용법

6. **Spring AOP APIs**: Spring AOP의 낮은 수준 API

7. **Resilience Features (복원력 기능)**: 애플리케이션 복원력을 위한 기능들

8. **Null-safety (Null 안전성)**: Null 처리 및 안전성 관련 기능

9. **Data Buffers and Codecs (데이터 버퍼와 코덱)**: 데이터 버퍼 처리 및 인코딩/디코딩

10. **Ahead of Time Optimizations (사전 최적화)**: AOT 컴파일 및 최적화

11. **Appendix (부록)**: 추가 참조 자료
