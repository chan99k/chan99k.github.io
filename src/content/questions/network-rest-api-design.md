---
title: "RESTful API 설계 원칙과 Best Practice를 설명하세요"
answer: "REST는 자원(Resource)을 URI로 표현하고, HTTP Method(GET, POST, PUT, DELETE)로 행위를 정의하며, 상태를 표현(Representation)으로 전달하는 아키텍처 스타일입니다. URI는 명사로, 행위는 Method로 표현하고(/users/1 GET), 계층 구조를 슬래시(/)로, 필터는 쿼리 파라미터(?status=active)로 표현합니다. 상태 코드(200, 201, 400, 404, 500)를 명확히 사용하고, 버전 관리(/api/v1), 페이지네이션, HATEOAS를 고려합니다. Idempotent(멱등성)를 보장하여 같은 요청을 여러 번 해도 같은 결과를 반환해야 합니다."
category: "network"
difficulty: 3
tags: ["REST API", "HTTP", "API 설계"]
source: "curated"
hints: ["자원과 행위 분리", "멱등성", "상태 코드"]
---

## 해설

설계 원칙:
```
Good:
GET /users/123          (사용자 조회)
POST /users             (사용자 생성)
PUT /users/123          (사용자 전체 수정)
PATCH /users/123        (사용자 부분 수정)
DELETE /users/123       (사용자 삭제)

Bad:
GET /getUser?id=123     (행위를 URI에 표현)
POST /users/delete/123  (DELETE Method 사용)
```

HTTP Method 특성:
- GET, PUT, DELETE: Idempotent (여러 번 호출해도 결과 동일)
- POST: Non-idempotent (호출마다 새 리소스 생성)
- GET, HEAD: Safe (서버 상태 변경 없음)

응답 구조:
```json
{
  "data": { ... },
  "message": "Success",
  "errors": [],
  "pagination": { "page": 1, "size": 20, "total": 100 }
}
```
