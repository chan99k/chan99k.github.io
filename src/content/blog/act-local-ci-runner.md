---
title: "나의 구원자, act 도입기"
description: "GitHub Actions 워크플로우를 로컬에서 실행하는 act 도입 과정에서 OrbStack 소켓 문제, Apple Silicon 호환성, 프로젝트 준비 상태까지 — Push & Pray 사이클을 끊기 위한 여정."
pubDate: "2026-03-05"
tags: ["Areas/infra", "Areas/software/도구"]
draft: true
---

GitHub Actions를 사용하여 워크플로우를 개발해 본 사람이라면 누구나 'Push & Pray'라는 고통스러운 사이클을 경험해 봤을 것이다. 로컬에서 코드를 수정하고, 확신이 없는 상태로 커밋과 푸시를 날린 뒤, 실행 결과를 초조하게 기다리는 과정 말이다. 이 느리고 비효율적인 피드백 루프는 개발 생산성을 저해하는 주된 요인이다.

```
스크립트 수정 -> 커밋 & 푸시 -> actions 결과 대기 -> 실패
```

```
# 로컬에서는 잘 도는데 왜 CI에서만...
Error: Process completed with exit code 1.
```

대강 위와 같은 에러 로그를 멍하니 바라보다가, 이 단순한 속도 저하 문제를 해결하기 위해 act라는 도구를 도입하기로 했다. act는 GitHub Actions 워크플로우를 로컬에서 직접 실행하게 해주는 강력한 CLI 도구이니, 개발 사이클에서 수 분을 절약해 줄 해결책처럼 보였다.

하지만 단순히 설치하고 실행하면 끝날 줄 알았던 기대와 달리, 나는 곧바로 몇 가지 문제에 봉착했다. 어떤 문제가 있었을까?

## OrbStack + Apple Silicon 환경 문제

먼저, 로컬 환경은 생각보다 훨씬 복잡하다는 점이 맘에 들지 않는다. macOS에서 표준 Docker Desktop 대신 가벼운 OrbStack을 사용하고 있었는데, act는 기본적으로 `/var/run/docker.sock` 경로를 찾도록 설계되어 있었다. 게다가 Apple Silicon 칩셋을 사용하는 내 환경에서는 아키텍처 호환성 문제까지 겹쳤다.

이 상황에서 단순히 Docker Desktop으로 돌아가는 것이 정답일까? 아니면 매번 긴 옵션을 타이핑하며 불편함을 감수해야 할까? 이를 해결하기 위해 Wrapper Script Pattern을 적용하여 환경의 특수성을 도구에 주입하는 것이 좋지 않을까?

### Wrapper Script Pattern

Wrapper Script는 복잡한 실행 옵션이나 환경 변수 설정을 스크립트 파일 하나로 캡슐화하는 패턴이다. 도구의 기본 동작을 사용자 환경에 맞게 재정의함으로써, 반복적인 설정을 자동화하고 실수할 여지를 줄여준다. act의 경우 소켓 경로와 아키텍처 설정을 래퍼 스크립트로 감싸두면, 개발자는 내부의 복잡성을 신경 쓰지 않고 단순한 명령어로 실행할 수 있다.

```bash
# scripts/check-ci.sh (Simplified)
# OrbStack을 감지하고 올바른 소켓 경로 설정
SOCKET_PATH="~/.orbstack/run/docker.sock"

act push \
    -j build-module \
    # OrbStack의 비표준 데몬 소켓을 지정
    --container-daemon-socket "$SOCKET_PATH" \
    # Apple Silicon에서 x86_64 호환성 보장
    --container-architecture linux/amd64
```

이렇게 하면 OrbStack을 포기하지 않고도 act가 내 로컬 환경의 특수성을 이해하도록 만들 수 있다. 하지만, 이번 act 도입 과정에서 가장 크게 지적해야 하는 문제 — 내가 얻은 진짜 교훈 — 는 이것이 아니다.

## 진짜 문제: 프로젝트의 준비 상태

환경 설정 문제를 해결하고 act가 드디어 워크플로우를 실행하기 시작했지만, 이번에는 빌드 단계에서 에러가 발생했다. `actions/setup-java` 액션에서 Gradle 캐시를 찾을 수 없다는 내용이었다.

음... 엔지니어라면 누구나 그렇듯 도구의 버그라고 확신하고 이슈 페이지를 뒤졌으나, 원인은 프로젝트가 `gradle init`조차 되지 않은 '빈 껍데기' 상태였다는 점에 있었다. 즉, 에러의 원인은 도구가 아니라 프로젝트의 '준비 상태(Context)' 그 자체였다.

이 과정에서 나는 act가 단순한 디버깅 도구를 넘어, 프로젝트의 새로운 Makefile 역할을 할 수 있다는 사실을 깨달았다.

### Act as a Local Task Runner

많은 프로젝트가 Makefile이나 `package.json` 스크립트를 사용하여 빌드, 테스트 작업을 자동화하지만, 이는 원격 CI 파이프라인과 미묘하게 달라 문제를 일으키곤 한다. act를 'Local Task Runner'로 활용하면 GitHub Actions 워크플로우 파일(`.github/workflows`)을 프로젝트의 유일한 '진실의 원천(Single Source of Truth)'으로 격상시킬 수 있다. 빌드와 테스트 로직을 한 번만 정의해두면, 로컬과 원격에서 동일하게 실행된다.

```yaml
# .github/workflows/ci.yml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build with Gradle
        run: ./gradlew build # 로컬에서도 act로 이 명령을 그대로 수행
```

이러한 접근은 "작업을 한 번 정의하면 모든 곳에서 동일하게 실행된다"는 패러다임을 가능하게 한다. 하지만 여기서 주의해야 할 점은, 로컬 실행은 어디까지나 '시뮬레이션'이지 '복제'가 아니라는 점이다.

### Simulation vs Replication

act는 도커 컨테이너를 통해 GitHub 러너 환경을 흉내 낸다. 이때 사용하는 이미지의 크기에 따라 trade-off가 발생한다.

| 이미지 | 크기 | 특징 |
|--------|------|------|
| Micro | ~200MB | Node.js만 포함. 가볍지만 의존성 직접 설치 필요 |
| Medium | ~500MB | 일반적인 도구 포함. 속도와 기능성의 균형 |
| Large | >17GB | 실제 GitHub 환경과 유사. 다운로드와 실행이 무거움 |

최고 수준의 호환성을 위해 `nektos/act-environments-ubuntu:18.04` 같은 이미지를 사용할 수도 있지만, 18GB가 넘는 이미지를 매번 로컬에서 돌리는 것은 배보다 배꼽이 더 큰 격이다. 게다가 `job.timeout-minutes` 같은 워크플로우 지시어는 무시되는 등 근본적인 차이도 존재한다.

## 마치며

결국 act 도입의 핵심은 도구의 사용법을 익히는 것이 아니었다. 아쉽게도 나는 수많은 시행착오를 겪고 나서야 깨달았다. CI 파이프라인은 프로젝트와 별개로 존재하는 관리 대상이 아니라, 프로젝트의 '건전성'을 증명하는 헌법과도 같다는 사실을 말이다.

act는 단지 그 심장 박동을 로컬에서 미리 들어볼 수 있게 해주는 청진기였을 뿐이다. 복잡한 도구를 아는 것도 중요하지만, 프로젝트의 '준비 상태'를 먼저 살피는 것이 더 중요하지 않을까?
