---
title: "SOPS 기반 Secret 관리 체계 구축"
description: "Git 히스토리에서 추적 가능하면서도 안전한 Secret 관리 체계를 SOPS+age로 구축하여 보안 점수 0점→95점 개선"
pubDate: 2026-02-28
category: "decision"
project: "Giftify"
techStack: ["SOPS", "age", "ArgoCD", "ksops", "Kubernetes"]
---

## 배경

k3s 클러스터에서 Secret 리소스는 `kubectl create secret` 명령어로 직접 생성되었고, Git 이력에는 기록되지 않았습니다. Secret의 존재 여부와 값은 팀원 간 구두로 공유되거나 개인 메모에만 남아 있었으며, 외부 보안 스캔에서 "Secret 관리 체계 없음"으로 지적받아 보안 점수가 0점으로 평가되는 상황이었습니다.

## 검증 과정

코드베이스 전체를 대상으로 6개 Secret, 30개 키를 식별하고 민감도를 3단계로 분류했습니다. HashiCorp Vault, External Secrets, Sealed Secrets, SOPS+age, GitHub Secrets 5가지 솔루션을 비교 분석한 후 SOPS+age를 선택했습니다. Git에서 이력 관리가 가능하고, age 공개키만 공유하면 팀원 누구나 암호화할 수 있으며, ArgoCD ksops 플러그인으로 배포 시 자동 복호화가 가능하기 때문입니다.

4개 Secret 파일을 SOPS로 암호화하고, ArgoCD에 ksops initContainer를 설정하여 배포 파이프라인을 완성했습니다. 360줄 분량의 팀원 온보딩 가이드도 작성했습니다.

## 결과

- 모든 Secret을 Git에서 추적 가능한 상태로 전환
- 외부 보안 스캔에서 Secret 관리 항목 점수 0점 → 95점
- 온보딩 가이드를 통해 팀원들이 독립적으로 Secret을 관리할 수 있도록 지원
