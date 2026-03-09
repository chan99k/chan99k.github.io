---
title: "디버깅: ArgoCD + EC2 배포 후 전체 인프라 복구까지의 여정"
description: ArgoCD가 관리하는 EC2(k3s) 환경에서 develop->main 머지 후 PostgreSQL 재초기화를
  시도하면서 Flyway 마이그레이션 버전 충돌, Elasticsearch arm64/amd64 아키텍처 불일치, ArgoCD git 인증
  실패, Secret 누락까지 연쇄적으로 발생한 문제를 하나씩 해결한 과정. 총 3개의 hotfix 브랜치와 6시간의 디버깅 끝에 전체
  Pod가 Running 상태로 복구되었다.
pubDate: 2026-02-24
tags:
  - 디버깅
  - 인프라
  - 개발/Docker
draft: false
---

# 디버깅: ArgoCD + EC2 배포 후 전체 인프라 복구까지의 여정

## TL;DR

ArgoCD가 관리하는 EC2(k3s) 환경에서 develop->main 머지 후 PostgreSQL 재초기화를 시도하면서 Flyway 마이그레이션 버전 충돌, Elasticsearch arm64/amd64 아키텍처 불일치, ArgoCD git 인증 실패, Secret 누락까지 연쇄적으로 발생한 문제를 하나씩 해결한 과정. 총 3개의 hotfix 브랜치와 6시간의 디버깅 끝에 전체 Pod가 Running 상태로 복구되었다.

## 배경

### 시스템 구성

```
+-------------------+         +---------------------+
|  GitHub (main)    |         |  GHCR (Container    |
|  - k8s manifests  |         |  Registry)          |
+--------+----------+         +----------+----------+
         |                               |
    3min polling                    2min polling
         |                               |
+--------v----------+         +----------v----------+
| ArgoCD            |         | ArgoCD Image        |
| (manifest sync)   |         | Updater (tag sync)  |
+--------+----------+         +----------+----------+
         |                               |
         +---------- k3s (EC2) ---------+
         |                               |
   +-----v------+  +-------+  +--------v---------+
   | PostgreSQL  |  | Redis |  | Elasticsearch    |
   | StatefulSet |  |       |  | StatefulSet      |
   +-------------+  +-------+  +------------------+
   | api-server  |  | Redpanda|  | Grafana        |
   | Deployment  |  |         |  | Prometheus     |
   +-------------+  +---------+  +----------------+
```

Giftify 프로젝트는 Mac(arm64)에서 개발하고, EC2(amd64)의 k3s 클러스터에 ArgoCD로 배포하는 구조다. develop 브랜치에서 기능 개발 후 main으로 merge commit 방식으로 머지하면, ArgoCD가 main 브랜치의 매니페스트 변경을 감지하여 자동 동기화한다.

이 세션에서는 develop->main 머지 후 PostgreSQL을 완전히 재초기화하면서 시작된 연쇄 장애를 다룬다.

---

## 발견 과정

### Q1: Flyway 마이그레이션 V0.0.12 버전 충돌

PostgreSQL StatefulSet과 PVC를 삭제하고 재생성한 뒤, api-server가 CrashLoopBackOff에 빠졌다. 로그를 확인하니 Flyway가 시작 시점에 실패하고 있었다.

```
Found more than one migration with version 0.0.12
Offenders:
- V0.0.12__add_colunm_order (sql)
- V0.0.12__payment_cancel (sql)
```

원인은 명확했다. 이전 hotfix에서 V0.0.11 충돌을 해결하며 `add_colunm_order`를 V0.0.12로 올렸는데, 별도 PR(#316 settlement)에서 추가된 V0.0.12(`payment_cancel`)와 V0.0.13(`payment_version_and_wallet_history_index`)이 이미 존재했다.

첫 번째 hotfix 브랜치에서는 settlement PR의 파일 존재를 인지하지 못한 채 V0.0.11만 V0.0.12로 올렸고, 머지 후에야 충돌이 드러났다. 이것은 Flyway의 "선형 버전 체계"와 "병렬 PR 개발"이 충돌하는 전형적인 패턴이다.

**해결**: `hotfix/migration-version-conflict` 브랜치를 새로 생성하여 파일명을 변경했다.

```
변경 전:
V0.0.12__payment_cancel.sql
V0.0.13__payment_version_and_wallet_history_index.sql

변경 후:
V0.0.14__payment_cancel.sql
V0.0.15__payment_version_and_wallet_history_index.sql
```

최종 마이그레이션 순서:
```
V0.0.11__add_colunm_order.sql
V0.0.12__create_settlement_tables.sql          (PR #316)
V0.0.13__drop_snapshot_tables.sql              (PR #316)
V0.0.14__payment_cancel.sql                    (재번호)
V0.0.15__payment_version_and_wallet_history_index.sql  (재번호)
```

### Q2: PostgreSQL initdb 스크립트 무시 문제

PostgreSQL Pod가 Running 상태가 되었지만, 로그에 다음 메시지가 나타났다.

```
/usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
```

처음에는 initdb 스크립트가 실행되지 않아 `giftify_db` 데이터베이스와 `g7app` 스키마가 생성되지 않았을 것이라고 추측했다. 그러나 실제로는 `POSTGRES_DB` 환경변수가 이미 `giftify_db`로 설정되어 있었고, PostgreSQL Docker 이미지는 이 환경변수를 통해 데이터베이스를 자동 생성한다.

"ignoring" 메시지의 원인은 PVC가 `/var/lib/postgresql/data`에 직접 마운트되기 때문이다. PVC 초기화 시 ext4 파일시스템이 `lost+found` 디렉토리를 생성하는데, PostgreSQL Docker entrypoint는 데이터 디렉토리가 비어있지 않으면 이미 초기화된 것으로 판단하고 initdb 스크립트를 건너뛴다. 단, `POSTGRES_DB` 환경변수는 별도 로직으로 처리되어 DB 자체는 정상 생성되었다.

이 문제를 근본적으로 해결하려면 `PGDATA` 환경변수를 서브디렉토리로 설정해야 한다.

```yaml
env:
  - name: PGDATA
    value: /var/lib/postgresql/data/pgdata
```

이 수정은 백로그에 등록하고 현재 세션에서는 수동으로 스키마를 생성하여 진행했다.

### Q3: Elasticsearch exec format error

api-server가 정상화된 후 elasticsearch Pod를 확인하니 CrashLoopBackOff 상태였다. 로그:

```
exec /bin/tini: exec format error
```

`exec format error`는 바이너리의 아키텍처가 실행 환경과 맞지 않을 때 발생한다. 커스텀 Elasticsearch 이미지를 Mac(arm64)에서 빌드했기 때문에 EC2(amd64)에서 실행할 수 없었다.

**해결**: `docker buildx`로 amd64 타겟 빌드 후 GHCR에 push했다.

```bash
docker buildx build \
  --platform linux/amd64 \
  -t ghcr.io/.../elasticsearch:9.2.4-custom \
  --push .
```

### Q4: Kubernetes 이미지 캐시 문제

amd64로 재빌드하여 같은 태그(`9.2.4-custom`)로 push했지만, Pod를 삭제하고 재시작해도 동일한 `exec format error`가 발생했다.

사용자가 핵심을 짚었다: "이게 이름이 똑같아서 다시 안 가져오는 것 아닌가요?"

정확했다. Kubernetes의 기본 `imagePullPolicy`는 태그가 `latest`가 아닌 경우 `IfNotPresent`다. 노드에 이미 `9.2.4-custom` 태그의 (arm64) 이미지가 캐시되어 있으므로, 같은 태그로 새 이미지를 push해도 다시 pull하지 않는다.

**해결**: 태그를 `9.2.4-custom-v2`로 변경하여 push하고, kustomization.yaml의 `newTag`도 업데이트했다.

```yaml
# infra/k3s/overlays/prod/kustomization.yaml
images:
  - name: giftify-elasticsearch
    newName: ghcr.io/.../elasticsearch
    newTag: 9.2.4-custom-v2    # 변경: 캐시 우회
```

### Q5: ArgoCD git 인증 실패

hotfix 브랜치들을 main에 머지한 뒤 ArgoCD sync를 기다렸는데, ArgoCD가 git repository에 접근하지 못했다.

```
Unable to create application: application spec for giftify-app has an invalid managed resources annotation:
rpc error: authentication required
```

원래 사용하던 GitHub PAT가 만료/폐기되어 argocd namespace의 repository secret에 저장된 인증 정보가 무효화된 것이었다.

처음에는 새 PAT로 secret을 재생성하려 했으나, 한 가지 사실을 간과하고 있었다. **GitHub 리포지토리가 public**이라는 점이다. Public 리포지토리는 인증 없이 접근 가능하므로, 오히려 잘못된 인증 정보가 들어있는 secret이 문제를 일으키고 있었다.

**해결**: repository secret을 삭제하고, ArgoCD UI에서 인증 정보 없이 HTTPS URL만으로 repository를 다시 연결했다. Public 리포지토리에 불필요한 인증 정보를 설정하면 해당 인증이 실패할 때 접근 자체가 차단될 수 있다.

### Q6: ES_URIS 환경변수 누락

모든 인프라 Pod가 정상화된 후에도 api-server가 Elasticsearch에 연결하지 못했다. 원인을 추적하니 `api-server-secrets`에 `ES_URIS` 키가 존재하지 않았다.

```bash
$ kubectl get secret api-server-secrets -n giftify -o jsonpath='{.data.ES_URIS}'
# (빈 출력)
```

base 매니페스트의 `secrets.yaml`에는 `ES_URIS`가 정의되어 있었지만, EC2에 실제 적용된 secret에는 빠져 있었다. 이전 수동 배포 과정에서 누락된 것으로 추정된다.

**해결**: `kubectl` + `jq`로 기존 secret에 키를 추가했다.

```bash
kubectl get secret api-server-secrets -n giftify -o json \
  | jq '.data["ES_URIS"] = "aHR0cDovL2VsYXN0aWNzZWFyY2g6OTIwMA=="' \
  | kubectl apply -f -
```

(`aHR0cDovL2VsYXN0aWNzZWFyY2g6OTIwMA==`는 `http://elasticsearch:9200`의 base64 인코딩)

이후 api-server Pod를 재시작하여 정상 연결을 확인했다.

### Q7: 전체 복구 확인

6개의 이슈를 모두 해결한 뒤 최종 상태를 확인했다.

```
NAME                          READY   STATUS    RESTARTS
api-server-xxx                1/1     Running   0
postgres-0                    1/1     Running   0
elasticsearch-0               1/1     Running   0
redis-xxx                     1/1     Running   0
redpanda-0                    1/1     Running   0
redpanda-console-xxx          1/1     Running   0
grafana-xxx                   1/1     Running   0
prometheus-xxx                1/1     Running   0
cloudflared-xxx               1/1     Running   0
```

ArgoCD에서 minio 관련 리소스만 "Suspended" 상태로 표시되었는데, 이는 prod overlay에서 `replicas: 0`과 `suspend: true`로 의도적으로 비활성화한 것이므로 정상이다.

---

## 근본 원인

이 세션의 문제들은 단일 근본 원인이 아니라 여러 독립적인 원인이 동시에 드러난 경우다.

| 문제 | 근본 원인 | 신뢰도 |
|------|----------|--------|
| Flyway 충돌 | 병렬 PR에서 같은 버전 번호 사용 | confirmed |
| initdb 무시 | PVC의 lost+found가 빈 디렉토리 검사 실패 유발 | confirmed |
| exec format error | Mac arm64에서 빌드한 이미지를 amd64에서 실행 | confirmed |
| 이미지 캐시 | imagePullPolicy: IfNotPresent + 동일 태그 | confirmed |
| ArgoCD 인증 | 만료된 PAT가 public repo 접근까지 차단 | confirmed |
| ES_URIS 누락 | 수동 배포 시 secret 키 누락 | likely |

---

## 수정 사항

### 1. Flyway 마이그레이션 재번호 (hotfix/migration-version-conflict)

```diff
- V0.0.12__payment_cancel.sql
+ V0.0.14__payment_cancel.sql

- V0.0.13__payment_version_and_wallet_history_index.sql
+ V0.0.15__payment_version_and_wallet_history_index.sql
```

### 2. CI main 브랜치 트리거 제거 (.github/workflows/ci.yml)

```diff
  on:
    push:
-     branches: [ develop, main ]
+     branches: [ develop ]
```

### 3. Elasticsearch 이미지 태그 변경 (infra/k3s/overlays/prod/kustomization.yaml)

```diff
  images:
    - name: giftify-elasticsearch
      newName: ghcr.io/.../elasticsearch
-     newTag: 9.2.4-custom
+     newTag: 9.2.4-custom-v2
```

### 4. ArgoCD repository 재연결

```
기존: HTTPS + PAT 인증 (만료)
변경: HTTPS only (인증 없음, public repo)
```

### 5. ES_URIS secret 패치

```bash
kubectl get secret api-server-secrets -n giftify -o json \
  | jq '.data["ES_URIS"] = "aHR0cDovL2VsYXN0aWNzZWFyY2g6OTIwMA=="' \
  | kubectl apply -f -
```

---

## 교훈

- **Flyway + 병렬 PR**: 마이그레이션 버전 번호를 PR별로 예약하거나, 머지 시점에 자동 재번호하는 방식을 검토한다. 충돌은 머지 후 런타임에서야 발견된다.
- **Docker 멀티플랫폼 빌드**: 개발 환경(arm64)과 배포 환경(amd64)이 다를 때 반드시 `--platform` 플래그를 사용한다. CI에서 빌드하면 이 문제를 원천 차단할 수 있다.
- **이미지 태그 불변성**: 동일 태그로 다른 내용의 이미지를 push하지 않는다. `imagePullPolicy: IfNotPresent`가 기본값이므로 노드 캐시가 우선한다. 내용이 바뀌면 태그도 바꾼다.
- **Public 리포지토리의 인증**: Public repo에 불필요한 인증 정보를 설정하면, 해당 인증이 만료될 때 접근 자체가 차단된다. 인증이 필요 없으면 설정하지 않는다.
- **PostgreSQL PGDATA 설정**: PVC를 `/var/lib/postgresql/data`에 직접 마운트하면 `lost+found`로 인해 initdb가 건너뛸 수 있다. `PGDATA`를 서브디렉토리(`/var/lib/postgresql/data/pgdata`)로 설정한다.
- **Secret 관리**: 매니페스트와 실제 클러스터 상태의 drift를 주기적으로 확인한다. ArgoCD가 관리하지 않는 수동 생성 secret은 특히 주의한다.

---

## References

- [Kubernetes Documentation - StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/#stable-storage) -- StatefulSet volumeClaimTemplates는 생성 후 수정 불가
- [Docker Hub - postgres](https://hub.docker.com/_/postgres) -- PostgreSQL Docker 이미지의 initdb는 데이터 디렉토리가 비어있을 때만 실행
- [GitHub Issue - docker-library/postgres#563](https://github.com/docker-library/postgres/issues/563) -- lost+found 디렉토리가 initdb를 방해하는 문제
- [Docker Documentation - Multi-platform builds](https://docs.docker.com/build/building/multi-platform/) -- exec format error는 바이너리 아키텍처 불일치 시 발생
- [Kubernetes Documentation - Images](https://kubernetes.io/docs/concepts/containers/images/#imagepullpolicy-defaulting) -- imagePullPolicy 기본값은 태그가 latest가 아니면 IfNotPresent
- [Flyway Documentation - Migrations](https://documentation.red-gate.com/fd/migrations-184127470.html) -- Flyway는 동일 버전 번호의 마이그레이션이 2개 이상이면 시작 실패
- [ArgoCD Documentation - Tracking Strategies](https://argo-cd.readthedocs.io/en/stable/user-guide/tracking_strategies/) -- ArgoCD polling 간격 기본값 3분
