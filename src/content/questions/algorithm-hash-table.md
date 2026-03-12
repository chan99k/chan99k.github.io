---
title: "Hash Table의 동작 원리와 충돌 해결 방법(Chaining, Open Addressing)을 설명하세요"
answer: "Hash Table은 Key를 해시 함수로 변환하여 배열 인덱스로 사용하며, 평균 O(1)로 삽입/조회/삭제가 가능합니다. Hash Collision은 서로 다른 Key가 같은 해시값을 가질 때 발생합니다. Chaining은 같은 인덱스에 연결 리스트로 저장하고, Open Addressing(Linear Probing)은 다음 빈 슬롯을 찾습니다. Chaining은 추가 메모리가 필요하지만 클러스터링이 없고, Open Addressing은 캐시 효율이 좋지만 삭제가 복잡합니다. Load Factor(채워진 비율)가 높아지면 Rehashing으로 크기를 확장합니다."
category: "algorithm"
difficulty: "mid"
tags: ["자료구조", "해시", "충돌"]
source: "curated"
hints: ["해시 함수", "Chaining vs Probing", "Rehashing"]
---

## 해설

Chaining:
```
Index 0: null
Index 1: [Key1, Value1] → [Key2, Value2]
Index 2: null
Index 3: [Key3, Value3]
```

Open Addressing (Linear Probing):
```
h(key) = 5 인데 5번 인덱스가 차있으면
→ 6번 확인 → 7번 확인 → 빈 곳에 저장
```

Java HashMap:
- Chaining 사용
- Load Factor 0.75 초과 시 Rehashing
- Java 8+: 연결 리스트가 길어지면(8개 이상) Red-Black Tree로 변환

좋은 해시 함수 조건:
- 균등 분포
- 빠른 연산
- 결정적(같은 입력 → 같은 출력)
