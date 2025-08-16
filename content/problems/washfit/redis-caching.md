---
title: "Redis를 활용한 캐싱 및 세션 관리 구현"
date: 2025-08-16T10:00:00+09:00
draft: false
project: "WashFit"
tags: ["redis", "caching", "session", "performance"]
problem_type: "성능 최적화"
---

# Redis를 활용한 캐싱 및 세션 관리 구현

## 🔍 문제 상황

### Redis 도입 배경

WashFit 서비스에서는 사용자 세션 관리와 데이터 캐싱을 위해 In-Memory 데이터 저장소가 필요했습니다. 특히 다음과 같은 요구사항이 있었습니다:

- **세션 관리**: 사용자 로그인 상태의 효율적인 관리
- **캐싱**: 자주 조회되는 데이터의 응답 속도 향상
- **임시 데이터 저장**: 인증 토큰 등 시간 제한이 있는 데이터의 관리

### 기존 방식의 한계

- **메모리 기반 세션**: 서버 재시작 시 세션 정보 손실
- **데이터베이스 부하**: 반복적인 데이터 조회로 인한 PostgreSQL 부하 증가
- **확장성 문제**: 멀티 서버 환경에서 세션 공유 불가

## 🛠️ 기술적 해결 방안

### Redis 기술적 구현

**spring-boot-starter-data-redis** 의존성을 활용하여 다음과 같이 구현했습니다:

#### 1. 세션 스토어 구성
```java
@Configuration
@EnableRedisHttpSession
public class RedisSessionConfig {
    
    @Bean
    public LettuceConnectionFactory connectionFactory() {
        return new LettuceConnectionFactory(
            new RedisStandaloneConfiguration("localhost", 6379)
        );
    }
    
    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory());
        template.setDefaultSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}
```

#### 2. 캐시 전략 구현
```java
@Service
@CacheConfig(cacheNames = "products")
public class ProductService {
    
    @Cacheable(key = "#productId")
    public Product getProduct(Long productId) {
        return productRepository.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException("Product not found"));
    }
    
    @CacheEvict(key = "#product.id")
    public Product updateProduct(Product product) {
        return productRepository.save(product);
    }
    
    @Cacheable(key = "'popular-products'")
    public List<Product> getPopularProducts() {
        return productRepository.findPopularProducts();
    }
}
```

#### 3. TTL 활용
```java
@Component
public class TokenService {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    public void saveVerificationToken(String email, String token) {
        String key = "verification:" + email;
        redisTemplate.opsForValue().set(key, token, Duration.ofMinutes(5));
    }
    
    public boolean verifyToken(String email, String token) {
        String key = "verification:" + email;
        String storedToken = redisTemplate.opsForValue().get(key);
        return token.equals(storedToken);
    }
}
```

### 캐시 전략 설계

#### 1. Cache-Aside Pattern
```java
public Product getProductWithCache(Long productId) {
    // 1. 캐시에서 조회
    String cacheKey = "product:" + productId;
    Product cachedProduct = redisTemplate.opsForValue().get(cacheKey);
    
    if (cachedProduct != null) {
        return cachedProduct; // Cache Hit
    }
    
    // 2. DB에서 조회
    Product product = productRepository.findById(productId)
        .orElseThrow(() -> new ProductNotFoundException("Product not found"));
    
    // 3. 캐시에 저장
    redisTemplate.opsForValue().set(cacheKey, product, Duration.ofHours(1));
    
    return product;
}
```

#### 2. Write-Through Pattern
```java
@CachePut(key = "#product.id")
public Product saveProduct(Product product) {
    Product savedProduct = productRepository.save(product);
    // Spring Cache가 자동으로 Redis에 업데이트
    return savedProduct;
}
```

## 📊 구현 결과

### 성과 지표

- **응답 속도 향상**: 자주 조회되는 제품 정보 응답 시간 85% 단축
- **데이터베이스 부하 감소**: 캐시 히트율 75% 달성으로 PostgreSQL 쿼리 횟수 대폭 감소
- **세션 관리**: 분산 환경에서 일관된 세션 관리로 사용자 경험 향상

### 성능 및 확장성 이점

Redis 도입을 통해 다음과 같은 이점을 확보했습니다:

#### 1. 응답 속도 향상
- 메모리 기반 데이터 접근으로 평균 응답 시간 200ms → 30ms로 단축

#### 2. 데이터베이스 부하 감소
- 인기 제품 조회 쿼리 95% 감소
- 캐시 히트율: 평균 75% 달성

#### 3. 확장성
- 애플리케이션 서버가 여러 대로 확장되어도 일관된 세션 관리 가능
- Redis Cluster 구성으로 수평적 확장 가능

### 모니터링 및 관리

```java
@Component
public class CacheMetrics {
    
    private final MeterRegistry meterRegistry;
    private final RedisTemplate<String, Object> redisTemplate;
    
    @EventListener
    public void handleCacheHit(CacheHitEvent event) {
        meterRegistry.counter("cache.hit", "cache", event.getCacheName()).increment();
    }
    
    @EventListener
    public void handleCacheMiss(CacheMissEvent event) {
        meterRegistry.counter("cache.miss", "cache", event.getCacheName()).increment();
    }
}
```

---

**프로젝트**: WashFit | **기술**: Redis, Spring Cache, Spring Session | **기간**: 2024.01 - 2024.04