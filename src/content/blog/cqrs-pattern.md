---
title: "CQRS Pattern"
description: "CQRS(Command Query Responsibility Segregation)는 데이터 저장소에 대한 읽기와 쓰기 작업을 별도의 데이터 모델로 분리하는 디자인 패턴이다. 각 모델을 독립적으로 최적화할 수 있어 애플리케이션의 성능, 확장성, 보안을 향상시킬 수 있다."
pubDate: "2026-03-05"
tags: ["Areas/architecture", "Areas/software/design-pattern", "Resources/translations/tech-blog"]
contentSource: "ai-generated"
draft: false
---

# CQRS Pattern

> 원문: [CQRS Pattern - Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs)

## 1. Highlights / Summary

CQRS(Command Query Responsibility Segregation)는 데이터 저장소에 대한 읽기(read)와 쓰기(write) 작업을 별도의 데이터 모델로 분리하는 디자인 패턴이다. 각 모델을 독립적으로 최적화할 수 있어 애플리케이션의 성능(performance), 확장성(scalability), 보안(security)을 향상시킬 수 있다.

전통적인 CRUD 아키텍처에서는 단일 데이터 모델이 읽기와 쓰기 모두에 사용되지만, 애플리케이션이 성장하면서 읽기와 쓰기의 성능 및 확장 요구사항이 달라지게 된다. CQRS는 이 비대칭성(asymmetry)을 해결하기 위해 명령(command)과 쿼리(query)를 명확히 분리한다. 명령은 데이터를 갱신하고, 쿼리는 데이터를 조회한다.

CQRS는 이벤트 소싱(Event Sourcing) 패턴과 결합하여 더 강력한 아키텍처를 구성할 수 있다. 이벤트 저장소(event store)가 쓰기 모델이자 유일한 진실의 원천(single source of truth)이 되고, 읽기 모델은 이벤트로부터 구체화된 뷰(materialized view)를 생성하여 쿼리에 최적화된 데이터를 제공한다.

---

## 2. Detailed Summary

### 2.1 Context and Problem (맥락과 문제)

전통적인 아키텍처에서는 단일 데이터 모델이 읽기와 쓰기 모두에 사용된다. 기본적인 CRUD 작업에는 적합하지만, 애플리케이션이 성장하면서 다음과 같은 도전 과제가 발생한다:

- **데이터 불일치(Data Mismatch)**: 읽기와 쓰기의 데이터 표현이 다른 경우가 많다. 업데이트에 필요한 필드가 읽기 시에는 불필요할 수 있다.
- **잠금 경합(Lock Contention)**: 동일 데이터 집합에 대한 병렬 작업이 잠금 경합을 유발한다.
- **성능 문제(Performance Problems)**: 데이터 저장소와 접근 레이어의 부하, 복잡한 쿼리로 인해 성능이 저하된다.
- **보안 도전(Security Challenges)**: 엔티티가 읽기와 쓰기 모두에 노출될 때 의도하지 않은 컨텍스트에서 데이터가 노출될 수 있다.

![전통적 CRUD 아키텍처](/images/cqrs-traditional-crud.png)

### 2.2 Solution - 명령과 쿼리의 분리

CQRS 패턴은 쓰기 작업(명령, command)과 읽기 작업(쿼리, query)을 분리한다.

**명령(Commands) 이해하기**: 명령은 저수준 데이터 업데이트가 아닌 특정 비즈니스 작업(business task)을 나타내야 한다. 예를 들어 호텔 예약 앱에서 "Set ReservationStatus to Reserved" 대신 "Book hotel room" 명령을 사용한다. 이는 사용자의 의도를 더 잘 포착하고 비즈니스 프로세스와 정렬된다.

| 개선 영역 | 권장 사항 |
|-----------|-----------|
| 클라이언트 측 검증(Client-side validation) | 명령 전송 전 조건 검증. 방이 없으면 "Book" 버튼 비활성화 |
| 서버 측 로직(Server-side logic) | 경쟁 조건(race condition) 등 엣지 케이스 처리. 대기 목록이나 대안 제안 |
| 비동기 처리(Async processing) | 명령을 큐에 배치하여 비동기 처리 |

**쿼리(Queries) 이해하기**: 쿼리는 데이터를 절대 변경하지 않는다. DTO(Data Transfer Object)로 필요한 데이터를 편리한 형식으로 반환하며, 도메인 로직이 포함되지 않는다.

![기본 CQRS 아키텍처](/images/cqrs-basic.png)

### 2.3 읽기 모델과 쓰기 모델의 분리 전략

**단일 데이터 저장소 내 모델 분리**: CQRS의 기본 수준. 읽기와 쓰기 모델이 단일 데이터베이스를 공유하되 각 작업에 대해 별도의 로직을 유지한다.

- **쓰기 모델(Write Model)**: 데이터를 갱신하거나 영속화하는 명령을 처리. 유효성 검사(validation)와 도메인 로직 포함. 트랜잭션 무결성(transactional integrity)에 최적화.
- **읽기 모델(Read Model)**: 데이터 조회 쿼리를 서빙. 프레젠테이션 레이어에 최적화된 DTO나 프로젝션(projection) 생성. 도메인 로직 없음.

**별도 데이터 저장소 분리**: 더 고급 구현. 읽기와 쓰기에 각각 다른 저장소 기술을 사용할 수 있다. 예를 들어 쓰기에는 관계형 데이터베이스, 읽기에는 문서 데이터베이스를 사용한다.

![별도 저장소 CQRS 아키텍처](/images/cqrs-separate-stores.png)

별도 저장소 사용 시 동기화가 필수이며, 일반적으로 쓰기 모델이 데이터베이스 갱신 시 이벤트를 발행하고 읽기 모델이 이를 소비하여 데이터를 갱신한다. 메시지 브로커와 데이터베이스를 단일 분산 트랜잭션(distributed transaction)에 포함시킬 수 없으므로 일관성(consistency) 문제가 발생할 수 있다.

### 2.4 Benefits of CQRS (이점)

- **독립적 확장(Independent Scaling)**: 읽기와 쓰기 모델이 독립적으로 확장 가능. 잠금 경합 최소화, 부하 시 시스템 성능 향상.
- **최적화된 데이터 스키마(Optimized Data Schemas)**: 읽기는 쿼리에, 쓰기는 갱신에 최적화된 스키마 사용.
- **보안(Security)**: 읽기와 쓰기를 분리하여 적절한 도메인 엔티티/작업만 쓰기 권한을 갖도록 보장.
- **관심사 분리(Separation of Concerns)**: 쓰기 측은 복잡한 비즈니스 로직, 읽기 측은 단순하고 쿼리 효율성에 집중.
- **단순한 쿼리(Simpler Queries)**: 읽기 데이터베이스에 구체화된 뷰(materialized view)를 저장하면 복잡한 조인 회피.

### 2.5 Problems and Considerations (문제와 고려사항)

- **복잡성 증가(Increased Complexity)**: CQRS의 핵심 개념은 단순하지만, 특히 이벤트 소싱과 결합하면 상당한 복잡성이 도입될 수 있다.
- **메시징 도전(Messaging Challenges)**: 메시징이 CQRS의 필수는 아니지만 명령 처리와 이벤트 발행에 자주 사용된다. 메시지 실패, 중복, 재시도 등의 문제를 고려해야 한다.
- **최종 일관성(Eventual Consistency)**: 읽기/쓰기 데이터베이스가 분리되면 읽기 데이터가 최신 변경을 즉시 반영하지 않을 수 있다. 사용자가 오래된 데이터(stale data)에 기반하여 행동하는 시나리오를 감지하고 처리해야 한다.

### 2.6 When to Use This Pattern (사용 시점)

**적합한 경우:**
- **협업 환경(Collaborative environments)**: 여러 사용자가 동시에 동일 데이터에 접근하고 수정하는 경우. 충분한 세분성(granularity)의 명령으로 충돌을 줄일 수 있다.
- **태스크 기반 UI(Task-based UI)**: 복잡한 프로세스나 도메인 모델을 통해 사용자를 안내하는 애플리케이션.
- **성능 튜닝 필요 시**: 읽기 성능을 쓰기와 별도로 세밀하게 조정해야 할 때. 특히 읽기가 쓰기보다 훨씬 많은 경우.
- **개발 관심사 분리**: 한 팀은 쓰기 모델의 복잡한 비즈니스 로직, 다른 팀은 읽기 모델과 UI 컴포넌트를 독립적으로 개발.
- **진화하는 시스템**: 새 모델 버전, 비즈니스 규칙 변경 등을 기존 기능에 영향 없이 수용하는 시스템.
- **시스템 통합**: 이벤트 소싱을 사용하는 다른 서브시스템과 통합. 서브시스템 일시 장애 시에도 가용성 유지.

**부적합한 경우:**
- 도메인이나 비즈니스 규칙이 단순할 때
- 단순한 CRUD 스타일 UI와 데이터 접근으로 충분할 때

### 2.7 Event Sourcing과 CQRS의 결합

이벤트 소싱과 CQRS를 결합하면:
- **이벤트 저장소(event store)**가 쓰기 모델이자 유일한 진실의 원천(single source of truth)
- 읽기 모델은 이벤트로부터 구체화된 뷰(materialized view)를 생성
- 현재 상태를 직접 저장하는 대신 이벤트 스트림(stream of events)을 쓰기 저장소로 사용
- 집합체(aggregate)에 대한 갱신 충돌 감소, 성능 및 확장성 향상
- 과거 이벤트를 재생(replay)하여 구체화된 뷰를 쉽게 재생성하거나 읽기 모델 변경에 적응 가능

**결합 시 고려사항:**
- 최종 일관성(eventual consistency) 발생
- 이벤트 생성, 처리, 뷰 조립을 위한 코드 필요로 복잡성 증가
- 뷰 생성(view generation)에 상당한 시간과 리소스 소모 가능 → 주기적 스냅샷(snapshot)으로 성능 개선

### 2.8 코드 예제 (C#)

**읽기 모델 (Query interface)**:
```csharp
namespace ReadModel
{
  public interface ProductsDao
  {
    ProductDisplay FindById(int productId);
    ICollection<ProductDisplay> FindByName(string name);
    ICollection<ProductInventory> FindOutOfStockProducts();
    ICollection<ProductDisplay> FindRelatedProducts(int productId);
  }

  public class ProductDisplay
  {
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal UnitPrice { get; set; }
    public bool IsOutOfStock { get; set; }
    public double UserRating { get; set; }
  }

  public class ProductInventory
  {
    public int Id { get; set; }
    public string Name { get; set; }
    public int CurrentStock { get; set; }
  }
}
```

**명령 (Command)**:
```csharp
public interface ICommand
{
  Guid Id { get; }
}

public class RateProduct : ICommand
{
  public RateProduct()
  {
    this.Id = Guid.NewGuid();
  }
  public Guid Id { get; set; }
  public int ProductId { get; set; }
  public int Rating { get; set; }
  public int UserId { get; set; }
}
```

**명령 핸들러 (Command Handler)**:
```csharp
public class ProductsCommandHandler :
    ICommandHandler<AddNewProduct>,
    ICommandHandler<RateProduct>,
    ICommandHandler<AddToInventory>,
    ICommandHandler<ConfirmItemShipped>,
    ICommandHandler<UpdateStockFromInventoryRecount>
{
  private readonly IRepository<Product> repository;

  public ProductsCommandHandler(IRepository<Product> repository)
  {
    this.repository = repository;
  }

  void Handle(RateProduct command)
  {
    var product = repository.Find(command.ProductId);
    if (product != null)
    {
      product.RateProduct(command.UserId, command.Rating);
      repository.Save(product);
    }
  }
  // ... other handlers
}
```

읽기 모델의 `ProductsDao`는 쿼리에 특화된 DTO를 반환하고, 쓰기 측의 `ProductsCommandHandler`는 도메인 로직을 통해 명령을 처리한다. 두 모델의 인터페이스가 분리되어 있으므로 독립적으로 진화하고 최적화할 수 있다.

---

## 3. Conclusion and Personal View

1. CQRS의 핵심은 "읽기와 쓰기의 비대칭성"을 인정하고 각각을 독립적으로 최적화하는 것이다. 대부분의 시스템에서 읽기는 쓰기보다 훨씬 많으므로 이 분리는 자연스러운 진화 방향이다.

2. 명령을 "비즈니스 의도(business intent)"로 설계하라는 조언은 DDD(Domain-Driven Design)의 유비쿼터스 언어(Ubiquitous Language) 원칙과 직접적으로 연결된다. "Book hotel room"이 "Set ReservationStatus to Reserved"보다 도메인 전문가와의 소통에 효과적이다.

3. 단일 저장소 CQRS → 별도 저장소 CQRS → Event Sourcing + CQRS로의 점진적 도입 경로가 명확하게 제시되어 있다. 처음부터 최대 복잡도로 시작할 필요가 없다.

4. 최종 일관성(eventual consistency)은 CQRS 도입의 가장 큰 트레이드오프이며, 사용자가 오래된 데이터에 기반하여 행동하는 시나리오를 사전에 설계해야 한다.

5. 쓰기 모델에서 집합체(aggregate) 개념의 활용과 명령의 세분성(granularity)이 동시성 충돌을 줄이는 핵심 전략이다. 이는 DDD의 aggregate 경계 설정과 밀접하게 관련된다.

6. 이벤트 소싱과의 결합은 강력하지만 복잡성도 크게 증가한다. 스냅샷(snapshot) 전략으로 이벤트 재생 성능 문제를 완화할 수 있다.

7. "도메인이나 비즈니스 규칙이 단순하면 CQRS를 사용하지 말라"는 조언은 과도한 엔지니어링(over-engineering)을 경고한다. 단순한 CRUD로 충분한 곳에 CQRS를 도입하면 복잡성만 증가한다.

8. 코드 예제에서 보듯이 읽기 모델(ProductsDao)과 쓰기 모델(ProductsCommandHandler)의 인터페이스가 완전히 분리되어 있어, 팀 간 독립적 개발과 배포가 가능하다.

---

## Related Resources

- Event Sourcing Pattern - 이벤트 기반 상태 관리와 감사 추적
- Materialized View Pattern - 효율적 쿼리를 위한 사전 계산된 뷰
- Circuit Breaker Pattern - 원격 서비스 장애 처리
