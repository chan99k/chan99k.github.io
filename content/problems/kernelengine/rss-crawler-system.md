---
title: "RSS 파서를 활용한 블로그 크롤링 시스템 구현"
date: 2025-08-16T10:00:00+09:00
draft: false
project: "KernelEngine"
tags: ["crawler", "rss", "jsoup", "automation"]
problem_type: "데이터 수집 자동화"
---

# RSS 파서를 활용한 블로그 크롤링 시스템 구현

## 🔍 문제 상황

### 데이터 수집의 중요성

KernelEngine 서비스의 핵심 가치는 **다양한 기술 블로그의 최신 게시글을 한 곳에서 검색**할 수 있게 하는 것이었습니다. 이를 위해서는 여러 블로그로부터 지속적으로 새로운 게시글을 수집하는 시스템이 필요했습니다.

### 기존 방식의 한계

- **수동 수집**: 각 블로그를 직접 방문하여 새 게시글 확인 (비효율적)
- **HTML 파싱**: 블로그 구조 변경 시 파싱 로직 수정 필요 (유지보수 부담)
- **일관성 부족**: 블로그마다 다른 HTML 구조로 인한 데이터 품질 문제

## 🛠️ 기술적 해결 방안

### 기술적 구현 방식

**Jsoup 라이브러리와 RSS 파서**를 활용하여 블로그 크롤링 시스템을 구현했습니다:

#### 1. RSS 기반 수집
- 표준화된 RSS 피드를 통한 안정적인 데이터 수집
- 블로그 HTML 구조에 의존하지 않는 방식

#### 2. HTML 파싱
- Jsoup을 활용한 웹 페이지 내용 추출
- CSS 셀렉터를 이용한 정확한 데이터 추출

#### 3. Spring Batch 통합
- 배치 처리를 통한 주기적 크롤링 작업 관리

### RSS 피드 파싱 구현

#### 1. RSS 피드 Reader
```java
@Component
public class RssFeedReader {
    
    private static final String USER_AGENT = "KernelEngine-Crawler/1.0";
    
    public List<RssItem> readFeed(String rssUrl) {
        try {
            Document doc = Jsoup.connect(rssUrl)
                .userAgent(USER_AGENT)
                .timeout(10000)
                .get();
            
            return parseRssItems(doc);
        } catch (IOException e) {
            log.error("Failed to read RSS feed: {}", rssUrl, e);
            return Collections.emptyList();
        }
    }
    
    private List<RssItem> parseRssItems(Document doc) {
        Elements items = doc.select("item");
        return items.stream()
            .map(this::parseRssItem)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
    
    private RssItem parseRssItem(Element item) {
        try {
            return RssItem.builder()
                .title(getTextOrEmpty(item, "title"))
                .link(getTextOrEmpty(item, "link"))
                .description(getTextOrEmpty(item, "description"))
                .pubDate(parseDate(getTextOrEmpty(item, "pubDate")))
                .author(getTextOrEmpty(item, "author"))
                .category(getTextOrEmpty(item, "category"))
                .build();
        } catch (Exception e) {
            log.warn("Failed to parse RSS item: {}", item.text(), e);
            return null;
        }
    }
}
```

#### 2. 블로그 관리 Entity
```java
@Entity
@Table(name = "blogs")
public class Blog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String rssUrl;
    
    @Column(nullable = false)
    private String siteUrl;
    
    @Enumerated(EnumType.STRING)
    private BlogStatus status = BlogStatus.ACTIVE;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime lastCrawledAt;
}
```

### 크롤링 아키텍처

크롤링 시스템은 다음과 같이 설계되었습니다:

#### 1. RSS 피드 파싱
```java
@Service
public class CrawlingService {
    
    private final BlogRepository blogRepository;
    private final PostRepository postRepository;
    private final RssFeedReader rssFeedReader;
    
    public void crawlAllBlogs() {
        List<Blog> activeBlogs = blogRepository.findByStatus(BlogStatus.ACTIVE);
        
        for (Blog blog : activeBlogs) {
            try {
                crawlBlog(blog);
                updateLastCrawledTime(blog);
            } catch (Exception e) {
                log.error("Failed to crawl blog: {}", blog.getName(), e);
                handleCrawlingError(blog, e);
            }
        }
    }
    
    private void crawlBlog(Blog blog) {
        List<RssItem> rssItems = rssFeedReader.readFeed(blog.getRssUrl());
        
        for (RssItem item : rssItems) {
            if (!postRepository.existsByLink(item.getLink())) {
                Post post = convertToPost(item, blog);
                postRepository.save(post);
                log.info("Saved new post: {}", post.getTitle());
            }
        }
    }
}
```

#### 2. 중복 검사
```java
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    boolean existsByLink(String link);
    
    @Query("SELECT p FROM Post p WHERE p.blog = :blog AND p.publishedAt > :since")
    List<Post> findRecentPostsByBlog(@Param("blog") Blog blog, @Param("since") LocalDateTime since);
    
    @Query("SELECT p FROM Post p WHERE p.link = :link")
    Optional<Post> findByLink(@Param("link") String link);
}
```

#### 3. 메타데이터 추출
```java
@Component
public class PostMetadataExtractor {
    
    public PostMetadata extractMetadata(String url) {
        try {
            Document doc = Jsoup.connect(url)
                .userAgent("KernelEngine-Crawler/1.0")
                .timeout(15000)
                .get();
            
            return PostMetadata.builder()
                .title(extractTitle(doc))
                .description(extractDescription(doc))
                .author(extractAuthor(doc))
                .tags(extractTags(doc))
                .publishedDate(extractPublishDate(doc))
                .content(extractContent(doc))
                .build();
        } catch (IOException e) {
            log.error("Failed to extract metadata from: {}", url, e);
            return PostMetadata.empty();
        }
    }
    
    private String extractContent(Document doc) {
        // 여러 선택자를 시도하여 본문 추출
        String[] contentSelectors = {
            "article", ".post-content", ".entry-content", 
            ".content", "#content", "main"
        };
        
        for (String selector : contentSelectors) {
            Elements elements = doc.select(selector);
            if (!elements.isEmpty()) {
                return cleanContent(elements.first().text());
            }
        }
        
        return "";
    }
}
```

#### 4. 데이터베이스 저장
```java
private Post convertToPost(RssItem rssItem, Blog blog) {
    // 추가 메타데이터 추출
    PostMetadata metadata = postMetadataExtractor.extractMetadata(rssItem.getLink());
    
    return Post.builder()
        .title(rssItem.getTitle())
        .link(rssItem.getLink())
        .description(rssItem.getDescription())
        .content(metadata.getContent())
        .author(metadata.getAuthor())
        .publishedAt(rssItem.getPubDate())
        .blog(blog)
        .tags(String.join(",", metadata.getTags()))
        .build();
}
```

### 배치 처리를 통한 자동화

**Spring Batch**와 연계하여 다음과 같은 자동화 기능을 구현했습니다:

#### 1. 크롤링 Job 설정
```java
@Configuration
@EnableBatchProcessing
public class CrawlingJobConfig {
    
    @Bean
    public Job crawlingJob() {
        return jobBuilderFactory.get("crawlingJob")
            .start(crawlBlogsStep())
            .next(updateStatisticsStep())
            .build();
    }
    
    @Bean
    public Step crawlBlogsStep() {
        return stepBuilderFactory.get("crawlBlogsStep")
            .tasklet(crawlingTasklet())
            .build();
    }
    
    @Bean
    public Tasklet crawlingTasklet() {
        return (contribution, chunkContext) -> {
            crawlingService.crawlAllBlogs();
            return RepeatStatus.FINISHED;
        };
    }
}
```

#### 2. 스케줄링 설정
```java
@Component
@EnableScheduling
public class CrawlingScheduler {
    
    private final JobLauncher jobLauncher;
    private final Job crawlingJob;
    
    @Scheduled(fixedRate = 3600000) // 1시간마다 실행
    public void runCrawlingJob() {
        try {
            JobParameters params = new JobParametersBuilder()
                .addLong("time", System.currentTimeMillis())
                .toJobParameters();
            
            jobLauncher.run(crawlingJob, params);
        } catch (Exception e) {
            log.error("Failed to run crawling job", e);
        }
    }
}
```

#### 3. 오류 처리 및 재시도
```java
@Component
public class CrawlingErrorHandler {
    
    private final BlogRepository blogRepository;
    
    public void handleCrawlingError(Blog blog, Exception error) {
        // 오류 횟수 증가
        blog.incrementErrorCount();
        
        // 3회 연속 실패 시 비활성화
        if (blog.getErrorCount() >= 3) {
            blog.setStatus(BlogStatus.INACTIVE);
            log.warn("Blog {} deactivated due to repeated failures", blog.getName());
        }
        
        blogRepository.save(blog);
    }
    
    @Retryable(
        value = {IOException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 2000)
    )
    public List<RssItem> readFeedWithRetry(String rssUrl) {
        return rssFeedReader.readFeed(rssUrl);
    }
}
```

## 📊 구현 결과

### 성과 지표

- **수집 효율성**: 30개 블로그에서 일평균 150개 게시글 자동 수집
- **데이터 품질**: RSS 표준 활용으로 95% 데이터 정확도 달성
- **운영 안정성**: 에러 처리 및 재시도 로직으로 99% 가용성 확보

### 자동화 효과

이를 통해 **사용자가 수동으로 블로그를 확인하지 않아도 항상 최신 기술 게시글을 검색할 수 있는 환경**을 제공할 수 있었습니다.

#### 1. 실시간성
- 1시간 주기로 자동 크롤링
- 새 게시글 발행 후 최대 1시간 내 서비스 반영

#### 2. 안정성
- RSS 피드 오류 시 자동 재시도
- 블로그 접근 불가 시 임시 비활성화

#### 3. 확장성
- 새로운 블로그 추가 시 설정만으로 크롤링 대상 확장
- 크롤링 주기 및 동시 처리 수 조정 가능

### 모니터링 및 관리

```java
@RestController
@RequestMapping("/admin/crawling")
public class CrawlingAdminController {
    
    @GetMapping("/status")
    public CrawlingStatus getCrawlingStatus() {
        return CrawlingStatus.builder()
            .totalBlogs(blogRepository.count())
            .activeBlogs(blogRepository.countByStatus(BlogStatus.ACTIVE))
            .totalPosts(postRepository.count())
            .todayPosts(postRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(1)))
            .lastCrawledAt(getLastCrawlingTime())
            .build();
    }
    
    @PostMapping("/blogs/{blogId}/crawl")
    public ResponseEntity<String> manualCrawl(@PathVariable Long blogId) {
        Blog blog = blogRepository.findById(blogId)
            .orElseThrow(() -> new BlogNotFoundException("Blog not found"));
        
        crawlingService.crawlBlog(blog);
        return ResponseEntity.ok("Crawling completed");
    }
}
```

---

**프로젝트**: KernelEngine | **기술**: RSS, Jsoup, Spring Batch, Scheduling | **기간**: 2023.11 - 2023.12