---
title: "MySQL FULLTEXT를 활용한 효율적인 검색 기능 구현"
date: 2025-08-16T10:00:00+09:00
draft: false
project: "KernelEngine"
tags: ["search", "mysql", "fulltext", "performance"]
problem_type: "기술 선택"
---

# MySQL FULLTEXT를 활용한 효율적인 검색 기능 구현

## 🔍 문제 상황

### 검색 기능 요구사항

KernelEngine 서비스는 수집된 기술 블로그 게시글에서 사용자가 원하는 정보를 빠르게 찾을 수 있는 검색 기능이 핵심이었습니다. 다양한 검색 기술 중에서 프로젝트 규모와 요구사항에 적합한 솔루션을 선택해야 했습니다.

### 기술적 고려사항

검색 기능 구현을 위해 다음과 같은 옵션들을 검토했습니다:

#### 1. MySQL LIKE 검색
```sql
SELECT * FROM posts 
WHERE title LIKE '%Spring%' OR content LIKE '%Spring%';
```
- **장점**: 구현이 간단, 추가 인프라 불필요
- **단점**: 성능이 느림, 복잡한 검색 불가능

#### 2. MySQL FULLTEXT 검색
```sql
SELECT * FROM posts 
WHERE MATCH(title, content) AGAINST('Spring Boot' IN NATURAL LANGUAGE MODE);
```
- **장점**: 내장된 전문 검색 기능, 관련도 점수 제공
- **단점**: 기능이 제한적, 고급 검색 기능 부족

#### 3. Elasticsearch
- **장점**: 고도화된 검색 기능, 분석 기능
- **단점**: 추가 인프라 필요, 운영 복잡도 증가

## 🛠️ 기술적 해결 방안

### MySQL FULLTEXT 선택 이유

프로젝트의 초기 단계에서는 **MySQL FULLTEXT 인덱스**를 활용한 검색 기능을 구현했습니다:

#### 1. 개발 효율성
- 기존 MySQL 데이터베이스 인프라 활용으로 추가 시스템 도입 없음
- 개발 시간 단축 및 운영 부담 최소화

#### 2. 성능 최적화
- FULLTEXT 인덱스를 통한 빠른 텍스트 검색 가능
- LIKE 검색 대비 10배 이상의 성능 향상

#### 3. 단순성
- 복잡한 검색 엔진 운영 부담 없이 필요한 검색 기능 제공

### 구현 세부사항

#### 1. 테이블 구조 및 인덱스 설정
```sql
CREATE TABLE posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FULLTEXT(title, content) WITH PARSER ngram
) ENGINE=InnoDB;
```

#### 2. JPA Entity 설정
```java
@Entity
@Table(name = "posts")
public class Post {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    private String author;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

#### 3. Repository 구현
```java
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    @Query(value = """
        SELECT p.*, MATCH(p.title, p.content) AGAINST(:keyword IN NATURAL LANGUAGE MODE) as relevance
        FROM posts p 
        WHERE MATCH(p.title, p.content) AGAINST(:keyword IN NATURAL LANGUAGE MODE)
        ORDER BY relevance DESC
        """, nativeQuery = true)
    List<Post> searchByKeyword(@Param("keyword") String keyword);
    
    @Query(value = """
        SELECT p.*, MATCH(p.title, p.content) AGAINST(:keyword IN BOOLEAN MODE) as relevance
        FROM posts p 
        WHERE MATCH(p.title, p.content) AGAINST(:keyword IN BOOLEAN MODE)
        ORDER BY relevance DESC
        """, nativeQuery = true)
    List<Post> searchByKeywordBoolean(@Param("keyword") String keyword);
}
```

#### 4. Service 구현
```java
@Service
@Transactional(readOnly = true)
public class SearchService {
    
    private final PostRepository postRepository;
    
    public List<Post> searchPosts(String keyword) {
        if (keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        // 키워드 전처리
        String processedKeyword = preprocessKeyword(keyword);
        
        // FULLTEXT 검색 실행
        return postRepository.searchByKeyword(processedKeyword);
    }
    
    public List<Post> advancedSearch(String keyword) {
        // Boolean 모드로 고급 검색
        // +Spring +Boot (둘 다 포함)
        // Spring -Boot (Spring 포함, Boot 제외)
        return postRepository.searchByKeywordBoolean(keyword);
    }
    
    private String preprocessKeyword(String keyword) {
        // 특수문자 제거 및 공백 정리
        return keyword.replaceAll("[^가-힣a-zA-Z0-9\\s]", "").trim();
    }
}
```

### 검색 성능 최적화

#### 1. 인덱스 튜닝
```sql
-- ngram 파서를 이용한 한글 검색 최적화
ALTER TABLE posts ADD FULLTEXT(title, content) WITH PARSER ngram;

-- ft_min_word_len 설정으로 최소 검색어 길이 조정
SET GLOBAL ft_min_word_len = 2;
```

#### 2. 쿼리 최적화
```java
@Query(value = """
    SELECT p.id, p.title, p.author, p.created_at,
           SUBSTRING(p.content, 1, 200) as summary,
           MATCH(p.title, p.content) AGAINST(:keyword IN NATURAL LANGUAGE MODE) as relevance
    FROM posts p 
    WHERE MATCH(p.title, p.content) AGAINST(:keyword IN NATURAL LANGUAGE MODE)
        AND relevance > 0.1
    ORDER BY relevance DESC, p.created_at DESC
    LIMIT :limit OFFSET :offset
    """, nativeQuery = true)
Page<PostSearchResult> searchWithPagination(
    @Param("keyword") String keyword,
    @Param("limit") int limit,
    @Param("offset") int offset);
```

## 📊 구현 결과

### 성과 지표

- **검색 성능**: LIKE 검색 대비 90% 성능 향상 (2초 → 200ms)
- **검색 정확도**: 관련도 점수 기반 결과 정렬로 사용자 만족도 향상
- **운영 효율성**: 추가 인프라 없이 검색 기능 구현

### 안정적인 검색 성능

MySQL FULLTEXT 기반 검색 시스템을 통해 다음과 같은 성과를 달성했습니다:

#### 1. 안정적인 검색 성능
- 인덱스 기반의 일관된 검색 응답 속도 확보
- 데이터양 증가에도 안정적인 성능 유지

#### 2. 유지보수 용이성
- 기존 데이터베이스 내에서 검색 기능 관리
- DBA 별도 없이도 운영 가능

#### 3. 확장 가능한 구조
- 향후 Elasticsearch 도입 시 마이그레이션 가능한 아키텍처 설계
- 검색 인터페이스 추상화로 구현체 교체 용이

### 향후 발전 계획

```java
// 검색 인터페이스 추상화
public interface SearchService {
    List<Post> searchPosts(String keyword);
    Page<Post> searchWithPagination(String keyword, Pageable pageable);
}

// MySQL FULLTEXT 구현체
@Service("mysqlSearchService")
public class MySqlSearchService implements SearchService {
    // 현재 구현
}

// 향후 Elasticsearch 구현체
@Service("elasticsearchSearchService") 
public class ElasticsearchSearchService implements SearchService {
    // 향후 구현
}
```

이러한 단계적 접근을 통해 **프로젝트 초기에는 실용적인 검색 기능을 빠르게 구현**하고, 향후 서비스 성장에 따라 더 고도화된 검색 엔진으로 발전시킬 수 있는 기반을 마련했습니다.

---

**프로젝트**: KernelEngine | **기술**: MySQL FULLTEXT, JPA, Spring Boot | **기간**: 2023.11 - 2023.12