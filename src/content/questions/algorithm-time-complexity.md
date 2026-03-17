---
title: "Big O 표기법과 주요 시간 복잡도(O(1), O(log n), O(n), O(n log n), O(n²))를 설명하세요"
answer: "Big O는 알고리즘의 최악의 경우 시간 복잡도를 나타냅니다. O(1)은 상수 시간으로 입력 크기와 무관하게 일정합니다(배열 인덱스 접근). O(log n)은 로그 시간으로 이진 탐색이 대표적입니다. O(n)은 선형 시간으로 전체 순회가 필요합니다. O(n log n)은 효율적인 정렬(Merge Sort, Quick Sort)이며, O(n²)은 이중 루프로 비효율적입니다(Bubble Sort). 실무에서는 데이터 크기를 고려하여 적절한 알고리즘을 선택해야 합니다."
category: "algorithm"
difficulty: 2
tags: ["알고리즘", "시간복잡도", "Big O"]
source: "curated"
hints: ["최악의 경우", "정렬 알고리즘", "데이터 크기"]
---

## 해설

복잡도별 예시:
- O(1): HashMap.get(), 배열[i]
- O(log n): 이진 탐색, TreeMap.get()
- O(n): 배열 순회, LinkedList 탐색
- O(n log n): Arrays.sort() (Tim Sort)
- O(n²): 이중 루프, Bubble Sort

성능 비교 (n = 1,000,000):
- O(1): 1
- O(log n): ~20
- O(n): 1,000,000
- O(n log n): ~20,000,000
- O(n²): 1,000,000,000,000

주의사항:
- 계수와 하위 항 무시: O(2n + 5) → O(n)
- Best/Average/Worst Case 구분
- 공간 복잡도도 고려 (메모리)

실무 예: 페이지네이션(O(1) 인덱스 접근) vs 풀스캔(O(n))
