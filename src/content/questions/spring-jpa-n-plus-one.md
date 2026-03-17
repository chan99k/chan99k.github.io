---
title: "JPA의 N+1 문제와 해결 방법(Fetch Join, Entity Graph, Batch Size)을 설명하세요"
answer: "N+1 문제는 1개의 쿼리로 N개의 엔티티를 조회한 후, 각 엔티티의 연관 관계를 조회하기 위해 N개의 추가 쿼리가 발생하는 문제입니다. Fetch Join(@Query에서 join fetch)은 한 번의 쿼리로 연관 엔티티를 함께 조회하고, Entity Graph는 어노테이션으로 Fetch 전략을 지정하며, Batch Size는 IN 절로 여러 ID를 한 번에 조회합니다. 페이징과 Fetch Join은 함께 사용 시 메모리에서 처리되므로 주의가 필요합니다."
category: "spring"
difficulty: 4
tags: ["JPA", "성능", "쿼리 최적화"]
source: "curated"
hints: ["Lazy Loading", "Fetch Join", "Batch Size"]
---

## 해설

N+1 발생 예시:
```java
// 1개 쿼리: 모든 Team 조회
List<Team> teams = teamRepository.findAll();

// N개 쿼리: 각 Team의 members 조회 (Lazy Loading)
for (Team team : teams) {
    team.getMembers().size();  // 추가 쿼리 발생!
}
```

해결 방법:

1. Fetch Join:
```java
@Query("select t from Team t join fetch t.members")
List<Team> findAllWithMembers();
```

2. Entity Graph:
```java
@EntityGraph(attributePaths = {"members"})
List<Team> findAll();
```

3. Batch Size:
```java
@BatchSize(size = 100)
@OneToMany(mappedBy = "team")
private List<Member> members;
// IN (?, ?, ..., ?) 로 100개씩 조회
```

주의: Fetch Join은 페이징 시 메모리에서 처리(HHH000104 경고)
