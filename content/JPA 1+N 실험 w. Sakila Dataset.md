---
title: JPA 1+N 실험 w. Sakila Dataset
draft: false
tags:
  - JPA
  - N+1
  - MySQL
---


## 서론
JPA에서 N+1 문제가 발생한다는 것은 누구나 알 만큼 널리 알려져 있습니다. 해당 문제에 대한 해결책 또한 귀에 박히도록 들어 알고는 있었는데요, 다만 그런 이론적 해결책들이 실제로는 어떤 성능적 차이를 보이는지 궁금해졌습니다. 그래서 이번 글에서는 MySQL 에서 제공하는 오픈소스 데이터셋인 Sakila 를 활용하여 실험을 해 보려고 합니다.

### 실험 환경
- **데이터베이스**: MySQL 8.0 (Docker)
- **프레임워크**: Spring Boot 3.5.5, Hibernate 6.6.26
- **Java**: 21
- **테스트 데이터**: FilmActor 엔티티 (총 5,462개 레코드)

#### 대상 엔티티 관계
```
FilmActor (5,462개)
├── Film (N:1) - 약 1,000개 고유 영화
└── Actor (N:1) - 약 200개 고유 배우
```

#### 테스트 시나리오
1. **N+1 문제 재현**: 순수한 지연 로딩으로 전체 데이터 조회
2. **@BatchSize**: 배치 크기별 성능 비교
3. **@EntityGraph**: 선언적 즉시 로딩 (내부적으론 Fetch Join)
4. **JPQL Fetch Join**: 명시적 JOIN 쿼리

---
먼저 이번 실험에 사용한 FilmActor 와 그 연관 엔티티는 다음과 같습니다.

#### FilmActor.java<!-- {"fold":true} -->
```java
@Table(name = "film_actor")
public class FilmActor {
 @EmbeddedId
 private FilmActorId id;

 @MapsId("actorId")
 @ManyToOne(fetch = FetchType.LAZY, optional = false)
 @JoinColumn(name = "actor_id", nullable = false)
 private Actor actor;

 @MapsId("filmId")
 @ManyToOne(fetch = FetchType.LAZY, optional = false)
 @JoinColumn(name = "film_id", nullable = false)
 private Film film;

 @ColumnDefault("CURRENT_TIMESTAMP")
 @Column(name = "last_update", nullable = false)
 private Instant lastUpdate;

}
```
#### Actor.java<!-- {"fold":true} -->
```java
@Entity
@Table(name = "actor")
public class Actor {
 @Id
 @Column(name = "actor_id", columnDefinition = "smallint UNSIGNED not null")
 private Integer id;

 @Column(name = "first_name", nullable = false, length = 45)
 private String firstName;

 @Column(name = "last_name", nullable = false, length = 45)
 private String lastName;
	


}
```
#### Film.java<!-- {"fold":true} -->
```java
@Entity
@Table(name = "film")
public class Film {
 @Id
 @Column(name = "film_id", columnDefinition = "smallint UNSIGNED not null")
 private Integer id;

 @Column(name = "title", nullable = false, length = 128)
 private String title;

}
```
####
---
## 1. N + 1 재현하기
### 문제 상황 코드
먼저, FilmActor 를 데이터베이스에 쿼리한 뒤, 지연 로딩이 설정된 영화 및 영화 배우 정보를 함께 조회하는 쿼리를 작성해보겠습니다.

#### 코드 예시
```java
List<FilmActorResponse> result = filmActors.stream()
 .map(filmActor -> new FilmActorResponse(
  filmActor.getFilm().getId(),
  filmActor.getFilm().getTitle(),        // N+1 발생!
  filmActor.getActor().getId(),
  filmActor.getActor().getFirstName(),   // N+1 발생!
  filmActor.getActor().getLastName()
 ))
 .toList();
```

### 성능 측정 결과
**시도 1 (콜드 스타트):**
```bash
N+1 처리 시간: 1028ms, 결과 개수: 5462
```
```bash
2025-08-27T23:06:30.560+09:00  INFO 72639 --- [sakila] [nio-8080-exec-2] i.StatisticalLoggingSessionEventListener : Session Metrics {
    2556375 nanoseconds spent acquiring 1 JDBC connections;
    0 nanoseconds spent releasing 0 JDBC connections;
    42935801 nanoseconds spent preparing 1198 JDBC statements;
    720374978 nanoseconds spent executing 1198 JDBC statements;
    0 nanoseconds spent executing 0 JDBC batches;
    0 nanoseconds spent performing 0 L2C puts;
    0 nanoseconds spent performing 0 L2C hits;
    0 nanoseconds spent performing 0 L2C misses;
    0 nanoseconds spent executing 0 flushes (flushing a total of 0 entities and 0 collections);
    83083 nanoseconds spent executing 1 pre-partial-flushes;
    4917 nanoseconds spent executing 1 partial-flushes (flushing a total of 0 entities and 0 collections)
}
```

**시도 2:**
```bash
N+1 처리 시간: 663ms, 결과 개수: 5462
```
```bash
025-08-27T23:07:44.390+09:00  INFO 72639 --- [sakila] [nio-8080-exec-4] i.StatisticalLoggingSessionEventListener : Session Metrics {
    5188958 nanoseconds spent acquiring 1 JDBC connections;
    0 nanoseconds spent releasing 0 JDBC connections;
    28479333 nanoseconds spent preparing 1198 JDBC statements;
    501947154 nanoseconds spent executing 1198 JDBC statements;
    0 nanoseconds spent executing 0 JDBC batches;
    0 nanoseconds spent performing 0 L2C puts;
    0 nanoseconds spent performing 0 L2C hits;
    0 nanoseconds spent performing 0 L2C misses;
    0 nanoseconds spent executing 0 flushes (flushing a total of 0 entities and 0 collections);
    10209 nanoseconds spent executing 1 pre-partial-flushes;
    3042 nanoseconds spent executing 1 partial-flushes (flushing a total of 0 entities and 0 collections)
}
```

**시도 3 :**
```bash
N+1 처리 시간: 501ms, 결과 개수: 5462
```
```bash
2025-08-27T23:08:34.114+09:00  INFO 72639 --- [sakila] [nio-8080-exec-8] i.StatisticalLoggingSessionEventListener : Session Metrics {
    1840917 nanoseconds spent acquiring 1 JDBC connections;
    0 nanoseconds spent releasing 0 JDBC connections;
    25767832 nanoseconds spent preparing 1198 JDBC statements;
    381965621 nanoseconds spent executing 1198 JDBC statements;
    0 nanoseconds spent executing 0 JDBC batches;
    0 nanoseconds spent performing 0 L2C puts;
    0 nanoseconds spent performing 0 L2C hits;
    0 nanoseconds spent performing 0 L2C misses;
    0 nanoseconds spent executing 0 flushes (flushing a total of 0 entities and 0 collections);
    15750 nanoseconds spent executing 1 pre-partial-flushes;
    2334 nanoseconds spent executing 1 partial-flushes (flushing a total of 0 entities and 0 collections)
}
```

### Hibernate Session Metrics 분석
세 번의 실행 모두에서 공통적으로 **1,198개의 JDBC 쿼리**가 실행되었습니다:
| 시도 | 총 처리시간 | JDBC 준비시간 | JDBC 실행시간 | 쿼리 수 |
|:-:|:-:|:-:|:-:|:-:|
| 1회차 | 1,028ms | 42.9ms | 720.4ms | 1,198개 |
| 2회차 | 663ms | 28.5ms | 501.9ms | 1,198개 |
| 3회차 | 501ms | 25.8ms | 382.0ms | 1,198개 |
### SQL 실행 로그 예시
실제로 실행되는 쿼리들을 살펴보면 다음과 같은 패턴을 확인할 수 있습니다.

```sql
-- 각 FilmActor마다 개별적으로 Film을 조회
select
    f1_0.film_id,
    f1_0.description,
    f1_0.language_id,
    f1_0.last_update,
    f1_0.length,
    f1_0.original_language_id,
    f1_0.rating,
    f1_0.release_year,
    f1_0.rental_duration,
    f1_0.rental_rate,
    f1_0.replacement_cost,
    f1_0.special_features,
    f1_0.title 
from
    film f1_0 
where
    f1_0.film_id=? -- 개별 ID로 하나씩 조회
```

#### 쿼리 구성 - 1,198개 쿼리
* **FilmActor 전체 조회**: 1개
* **개별 Film 조회**: ~1,000개 (중복 제거된 고유 영화)
* **개별 Actor 조회**: ~200개 (중복 제거된 고유 배우)

이론적 최대치인 5,462개보다 훨씬 적은 쿼리가 실행된 이유는 **JPA 영속성 컨텍스트의 1차 캐시** 덕분에 **동일한 Film이나 Actor는 추가 쿼리 없이 캐시에서 조회할 수 있었기 때문**으로 확인됩니다. 아래와 같이 **캐시 히트가 발생하는 로그**를 확인할 수 있습니다.

```shell
2025-08-27T23:26:25.725+09:00 TRACE 73278 --- [sakila] [nio-8080-exec-2] o.h.e.internal.DefaultLoadEventListener  : Loading entity: [chan99k.sakila.adapter.persistence.entities.Language#1]
2025-08-27T23:26:25.725+09:00 TRACE 73278 --- [sakila] [nio-8080-exec-2] o.h.e.internal.DefaultLoadEventListener  : Entity proxy found in session cache
```


---
## 2. EntityGraph 사용

### 구현 방법
`@EntityGraph` 어노테이션을 사용하여 를 사용하여 선언적으로 연관관계를 즉시 로딩할 수 있습니다.

```java
@Repository
public interface FilmActorRepository extends JpaRepository<FilmActor, FilmActorId> {
    
    @EntityGraph(attributePaths = {"film", "actor"})
    @Query("SELECT fa FROM FilmActor fa ORDER BY fa.film.id")
    List<FilmActor> findAllWithEntityGraph();
}
```

### 성능 측정 결과
**@EntityGraph 적용**
| 시도 | 처리 시간 | JDBC 준비시간 | JDBC 실행시간 | 쿼리 수 |
|:-:|:-:|:-:|:-:|:-:|
| 1회차 | 338ms | 3.1ms | 67.5ms | 1개 |
| 2회차 | 188ms | 0.7ms | 77.5ms | 1개 |
| 3회차 | 230ms | 0.5ms | 83.1ms | 1개 |
**종합 성능 비교:**
| 해결책 | 평균 처리시간 | 쿼리 수 | 성능 향상률 |
|:-:|:-:|:-:|:-:|
| N+1 문제 | ~730ms | 1,198개 | - |
| @BatchSize(50) | ~396ms | 25개 | 84% 향상 |
| @EntityGraph | ~252ms | 1개 | 190% 향상 |
### 생성되는 SQL 분석
@EntityGraph가 생성하는 SQL을 살펴보면, 아래와 같이 Join 을 통해 한번에 필요한 레코드를 모두 조회해옴을 확일할 수 있습니다.

```sql
*/* SELECT fa FROM FilmActor fa ORDER BY fa.film.id */*
SELECT fa1_0.actor_id, fa1_0.film_id,
       a1_0.actor_id, a1_0.first_name, a1_0.last_name, a1_0.last_update,
       f1_0.film_id, f1_0.description, f1_0.language_id, f1_0.last_update,
       f1_0.length, f1_0.original_language_id, f1_0.rating, f1_0.release_year,
       f1_0.rental_duration, f1_0.rental_rate, f1_0.replacement_cost,
       f1_0.special_features, f1_0.title, fa1_0.last_update
FROM film_actor fa1_0 
JOIN actor a1_0 ON a1_0.actor_id = fa1_0.actor_id 
JOIN film f1_0 ON f1_0.film_id = fa1_0.film_id 
ORDER BY fa1_0.film_id 
LIMIT ?
```

### 동작 원리 분석

**1** **단일 쿼리**: 모든 데이터를 하나의 JOIN 쿼리로 조회
**2** **INNER JOIN**: 연관관계가 필수인 경우 INNER JOIN 사용
**3** **완전한 N+1 해결**: 추가 쿼리 없이 모든 데이터 로딩
**4** **선언적 방식**: 어노테이션으로 간단하게 설정

⠀@EntityGraph vs @BatchSize 비교
| 특성 | @BatchSize | @EntityGraph |
|:-:|:-:|:-:|
| 쿼리 수 | 25개 | 1개 |
| 네트워크 I/O | 25번 | 1번 |
| 메모리 사용 | 단계적 로딩 | 한 번에 로딩 |
| 복잡한 조건 | 제한적 | 유연함 |
| 성능 | 84% 향상 | 190% 향상 |

---
## 3. Fetch Join
### 구현 방법
JPQL에서 명시적으로 Fetch Join을 사용하여 연관관계를 조회합니다:

```java
@Repository
public interface FilmActorRepository extends JpaRepository<FilmActor, FilmActorId> {
    
    @Query("SELECT fa FROM FilmActor fa " +
           "JOIN FETCH fa.film " +
           "JOIN FETCH fa.actor " +
           "ORDER BY fa.film.id")
    List<FilmActor> findAllWithFetchJoin();
}
```

### 성능 측정 결과
#### **JPQL Fetch Join 실행 결과**
| 시도 | 처리 시간 | JDBC 준비시간 | JDBC 실행시간 | 쿼리 수 |
|:-:|:-:|:-:|:-:|:-:|
| 1회차 | 217ms | 3.5ms | 81.1ms | 1개 |
| 2회차 | 131ms | 0.6ms | 89.9ms | 1개 |
| 3회차 | 129ms | 0.5ms | 80.4ms | 1개 |

---

### 최종 비교 종합
| 해결책 | 평균 처리시간 | 쿼리 수 | 성능 향상률 |
|:-:|:-:|:-:|:-:|
| N+1 문제 | ~730ms | 1,198개 | - |
| @BatchSize(50) | ~396ms | 25개 | 84% 향상 |
| @EntityGraph | ~252ms | 1개 | 190% 향상 |
| JPQL Fetch Join | ~159ms | 1개 | 359% 향상 |


#### 생성되는 SQL 비교
```sql
*-- @EntityGraph 생성 SQL*
FROM film_actor fa1_0 
JOIN actor a1_0 ON a1_0.actor_id = fa1_0.actor_id 
JOIN film f1_0 ON f1_0.film_id = fa1_0.film_id 
ORDER BY fa1_0.film_id

*-- JPQL Fetch Join 생성 SQL*  
FROM film_actor fa1_0 
JOIN film f1_0 ON f1_0.film_id = fa1_0.film_id 
JOIN actor a1_0 ON a1_0.actor_id = fa1_0.actor_id 
ORDER BY f1_0.film_id
```

두 방식 모두 동일한 INNER JOIN을 생성하지만 JOIN 순서와 ORDER BY 기준이 조금씩 다릅니다. ( 이 말인 즉, 어떤 쿼리가 실행되는지는 개발자가 디버깅을 하고 있어야 합니다…! )




---

참고 :
- [The JPA and Hibernate second-level cache](https://vladmihalcea.com/jpa-hibernate-second-level-cache/)
- [N+1 query problem with JPA and Hibernate](https://vladmihalcea.com/n-plus-1-query-problem/)
- [How to avoid the Hibernate Query Cache N+1 issue](https://vladmihalcea.com/hibernate-query-cache-n-plus-1-issue/)
- [How to detect the Hibernate N+1 query problem during testing](https://vladmihalcea.com/how-to-detect-the-n-plus-one-query-problem-during-testing/)
