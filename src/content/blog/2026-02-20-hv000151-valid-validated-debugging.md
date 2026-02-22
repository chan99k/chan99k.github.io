---
title: "디버깅 HV000151: @Valid와 @Validated가 만나면 생기는 일"
description: "@Validated 컨트롤러가 인터페이스를 구현할 때, 구현체에만 @Valid를 선언하면 Hibernate Validator가 서브타입이 파라미터 제약을 추가했다고 판단하여 HV000151을 발생시킨다. 이 에러는 해당 메서드만이 아니라 클래스 전체의 메타데이터 빌드를 실패시켜, 모든 엔드포인트가 500을 반환한다."
pubDate: "2026-02-20"
tags: ["개발/Spring", "디버깅"]
draft: false
---

# 디버깅 HV000151: @Valid와 @Validated가 만나면 생기는 일

## TL;DR

`@Validated` 컨트롤러가 인터페이스를 구현할 때, 구현체에만 `@Valid`를 선언하면 Hibernate Validator가 "서브타입이 파라미터 제약을 추가했다"고 판단하여 HV000151을 발생시킨다.
이 에러는 해당 메서드만이 아니라 **클래스 전체**의 메타데이터 빌드를 실패시켜, 모든 엔드포인트가 500을 반환한다.
수정: `@Valid`를 구현체에서 인터페이스로 이동.

---

## 배경

Giftify 프로젝트의 친구 시스템은 헥사고날 아키텍처를 따른다.
Swagger 문서화를 위해 인터페이스(`FriendshipV2ApiSpec`)에 API 스펙을 정의하고,
컨트롤러(`FriendshipV2Controller`)가 이를 구현하는 패턴이다.

요청 DTO는 다음과 같은 단순한 record다:

```java
// bc/member/.../dto/SendFriendRequestDto.java
public record SendFriendRequestDto(
        @NotNull Long receiverId
) {}
```

`@NotNull`이 선언되어 있으므로, `@Valid`가 어딘가에 있어야 이 제약 조건이 검증된다.

문제가 된 시점에, 두 파일의 `sendRequest` 메서드는 다음과 같았다:

```java
// FriendshipV2ApiSpec.java (인터페이스) -- @Valid 없음
@Tag(name = "FriendShip V2", description = "소셜 기능 관련 API")
public interface FriendshipV2ApiSpec {

    @Operation(summary = "친구 요청 전송")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "친구 요청 생성 성공"),
        @ApiResponse(responseCode = "400", description = "자기 자신에게 요청 / 탈퇴 회원에게 요청"),
        @ApiResponse(responseCode = "404", description = "대상 회원을 찾을 수 없음"),
        @ApiResponse(responseCode = "409", description = "이미 친구 관계가 존재함")
    })
    ResponseEntity<RsData<FriendshipResponse>> sendRequest(
        @Parameter(hidden = true) @CurrentMemberId Long memberId,
        SendFriendRequestDto request   // <-- @Valid 없음
    );

    // ... accept, reject, remove, getFriends, getReceivedRequests
}
```

```java
// FriendshipV2Controller.java (구현체) -- @Valid 있음
@RestController
@RequiredArgsConstructor
@Validated                               // <-- 클래스 레벨 메서드 검증 활성화
public class FriendshipV2Controller implements FriendshipV2ApiSpec {

    private final SendFriendRequestUseCase sendFriendRequestUseCase;
    private final AcceptFriendRequestUseCase acceptFriendRequestUseCase;
    // ... 나머지 UseCase 주입

    @Override
    @PostMapping("/api/v2/friends/request")
    public ResponseEntity<RsData<FriendshipResponse>> sendRequest(
        @CurrentMemberId Long memberId,
        @RequestBody @Valid SendFriendRequestDto request) {   // <-- 여기만 @Valid
        Friendship friendship = sendFriendRequestUseCase.sendRequest(
            memberId, request.receiverId());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(RsData.success(FriendshipResponse.from(friendship)));
    }

    // ... accept, reject, remove, getFriends, getReceivedRequests
}
```

얼핏 보면 문제가 없어 보인다. `@Valid @RequestBody`는 Spring MVC에서 가장 흔한 패턴이니까.
그런데 서버를 기동하면 친구 시스템의 **6개 엔드포인트 전체**가 500 에러를 반환했다:

```
jakarta.validation.ConstraintDeclarationException:
HV000151: A method overriding another method must not redefine
the parameter constraint configuration
```

---

## 발견 과정

### Q1: 왜 "전체" 엔드포인트가 죽는가?

HV000151은 메서드 단위가 아니라 **클래스 단위**로 발생한다.

`@Validated`가 클래스에 선언되면, Spring의 `MethodValidationPostProcessor`가 해당 빈에 대해
AOP 프록시를 생성하고 `MethodValidationInterceptor`를 등록한다.
이 과정에서 Hibernate Validator는 **클래스의 모든 메서드**에 대해 타입 계층 전체의
파라미터 제약 일관성을 검사한다.

```
FriendshipV2Controller 빈 생성
  --> @Validated 감지
  --> MethodValidationPostProcessor가 프록시 생성 시도
  --> HV가 sendRequest()의 제약 계층 검사
  --> 인터페이스: @Valid 없음, 구현체: @Valid 있음 --> 불일치!
  --> ConstraintDeclarationException (HV000151)
  --> 프록시 생성 실패
  --> 빈 등록 실패 or 모든 메서드 호출 시 예외
  --> accept(), reject(), remove(), getFriends(), getReceivedRequests() 전부 500
```

`sendRequest`에만 `@Valid`가 있지만, 클래스 전체가 무력화된다.

---

### Q2: @Valid가 왜 인터페이스와 구현체에서 위치가 다르면 안 되는가?

#### Jakarta Bean Validation 스펙(JSR 380) Section 5.6.5

Jakarta Bean Validation 3.0 스펙은 **섹션 5.6.5 "Method constraints in inheritance hierarchies"** 에서
타입 계층에서의 파라미터 제약 조건에 대해 세 가지 규칙을 정의한다:

> 1. 서브타입의 오버라이딩/구현 메서드에 파라미터 제약을 추가해서는 안 된다.
> 2. 여러 병렬 타입(parallel types)에서 선언된 메서드를 오버라이딩하는 경우에도 파라미터 제약을 추가해서는 안 된다.
> 3. 서브타입의 오버라이딩/구현 메서드에 리턴 값 제약은 추가할 수 있다.
>
> -- Jakarta Bean Validation 3.0 Specification, Section 5.6.5

이 규칙은 **리스코프 치환 원칙(LSP)** 에 기반한다.
Jakarta EE Tutorial은 이 원칙을 다음과 같이 설명한다:

> "주어진 타입에 대해, 서브타입은 에러 없이 치환될 수 있어야 한다.
> 예를 들어 `Person` 클래스와 이를 확장하는 `Employee` 서브클래스가 있다면,
> `Person` 인스턴스를 사용하는 모든 곳에서 `Employee` 인스턴스도 사용할 수 있어야 한다.
> `Employee`가 `Person`의 메서드를 오버라이드하면서 파라미터 제약을 추가하면,
> `Person`에서는 유효했던 파라미터가 `Employee`에서는 검증 예외를 발생시킬 수 있다."
>
> -- [Jakarta EE Tutorial: Using Method Constraints in Type Hierarchies](https://docs.oracle.com/javaee/7/tutorial/bean-validation-advanced004.htm)

스펙의 용어로 정리하면:
- **파라미터 제약 = 사전 조건(preconditions)**: 호출자가 만족시켜야 하는 조건
- **리턴 값 제약 = 사후 조건(postconditions)**: 메서드가 보장하는 조건
- **사전 조건 강화 금지**: 서브타입이 더 엄격한 입력 조건을 요구하면 안 된다
- **사후 조건 약화 금지**: 서브타입이 더 느슨한 출력 보장을 해서는 안 된다
- **위반 시**: `ConstraintDeclarationException` 발생

우리 코드에 이 규칙을 대입하면:

```
FriendshipV2ApiSpec (슈퍼타입)
  sendRequest(..., SendFriendRequestDto request)
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                   제약 없음 (아무거나 OK = 느슨한 사전 조건)

FriendshipV2Controller (서브타입)
  sendRequest(..., @Valid SendFriendRequestDto request)
                   ^^^^^^
                   제약 추가! (유효한 것만 OK = 강화된 사전 조건)

--> 서브타입이 사전 조건을 강화 --> LSP 위반 --> HV000151
```

#### @Valid는 "제약"인가? -- Hibernate Validator 소스로 확인

여기서 미묘한 의문이 생긴다. `@Valid`는 `@NotNull`이나 `@Size` 같은 제약 어노테이션이 아니라
**cascaded validation marker**(연쇄 검증 마커)다.
"파라미터 제약을 추가해서는 안 된다"는 규칙이 `@Valid`에도 적용되는지는
스펙 문서만으로는 명확하지 않다.

Hibernate Validator(HV) 소스 코드가 이 질문에 답한다.

HV000151을 발생시키는 룰 클래스:

```java
// OverridingMethodMustNotAlterParameterConstraints.java
public class OverridingMethodMustNotAlterParameterConstraints
        extends MethodConfigurationRule {

    @Override
    public void apply(ConstrainedExecutable method,
                      ConstrainedExecutable otherMethod) {
        if ( isDefinedOnSubType( method, otherMethod )
                && otherMethod.hasParameterConstraints()
                && !method.isEquallyParameterConstrained( otherMethod ) ) {
            throw LOG.getParameterConfigurationAlteredInSubTypeException(
                    method.getCallable(),
                    otherMethod.getCallable()
            );
        }
    }
}
```

핵심은 `isEquallyParameterConstrained()` 메서드다:

```java
// ConstrainedExecutable.java
public boolean isEquallyParameterConstrained(ConstrainedExecutable other) {
    // 1) cross-parameter 제약 비교
    if ( !getDescriptors( crossParameterConstraints ).equals(
        getDescriptors( other.crossParameterConstraints ) ) ) {
        return false;
    }
    // 2) 각 파라미터별 비교
    int i = 0;
    for ( ConstrainedParameter parameter : parameterMetaData ) {
        ConstrainedParameter otherParameter = other.getParameterMetaData( i );
        // cascading 메타데이터 비교 -- @Valid가 여기에 해당
        if ( !parameter.getCascadingMetaDataBuilder().equals(
            otherParameter.getCascadingMetaDataBuilder() )
            // 제약 어노테이션 비교 -- @NotNull, @Size 등이 여기에 해당
            || !getDescriptors( parameter.getConstraints() ).equals(
            getDescriptors( otherParameter.getConstraints() ) ) ) {
            return false;
        }
        i++;
    }
    return true;
}
```

**`getCascadingMetaDataBuilder()`를 비교**한다. `@Valid`는 cascading 메타데이터로 표현되므로,
인터페이스와 구현체에서 `@Valid` 유무가 다르면 `isEquallyParameterConstrained()`가
`false`를 반환하고 HV000151이 발생한다.

그리고 `hasParameterConstraints()`도 확인해보면:

```java
// AbstractConstrainedElement.java
public boolean isConstrained() {
    return cascadingMetaDataBuilder
               .isMarkedForCascadingOnAnnotatedObjectOrContainerElements()  // @Valid
        || cascadingMetaDataBuilder
               .hasGroupConversionsOnAnnotatedObjectOrContainerElements()
        || !constraints.isEmpty()          // @NotNull, @Size 등
        || !typeArgumentConstraints.isEmpty();
}
```

**첫 번째 조건**이 `@Valid`(cascading) 여부를 확인한다.
즉, HV는 `@Valid`를 `@NotNull`이나 `@Size`와 **동일한 수준**의 "파라미터 제약 설정"으로 취급한다.

정리하면:

```
"parameter constraint configuration" (HV의 정의)
  = constraint annotations (@NotNull, @Size, ...)
  + cascading markers (@Valid)
  + group conversions (@ConvertGroup)
  + type argument constraints (List<@Valid Item>)

이 중 어느 하나라도 인터페이스와 구현체에서 다르면 --> HV000151
```

---

### Q3: @Valid는 인터페이스에 두는 것이 계약 관점에서 맞지 않은가?

여기서 흥미로운 질문이 나왔다:

> `@Parameter(hidden = true)` 같은 Swagger 어노테이션은 인터페이스에 두어 문서 계약을 명시한다.
> 그렇다면 `@Valid`도 인터페이스에 두어 검증 계약을 명시하는 것이 일관되지 않은가?

결론부터 말하면, **`@Valid`는 인터페이스에 두는 것이 맞다**. 하지만 그 이유를 정확히 이해하려면
`@Parameter`와 `@Valid`의 본질적 차이를 알아야 한다.

**`@Parameter(hidden = true)`는 순수 메타데이터다.**
Swagger/SpringDoc이 빌드 타임에 읽어서 API 문서를 생성할 뿐,
런타임에 어떤 동작도 트리거하지 않는다. 인터페이스에 선언해도 부작용이 없다.

**`@Valid`는 런타임 동작을 트리거한다.**
그리고 Spring에서 `@Valid`가 동작하는 경로는 두 가지로 분기된다:

```
경로 1: Spring MVC 내장 검증
  @Valid @RequestBody SomeDto dto
  --> RequestResponseBodyMethodProcessor가 처리
  --> 컨트롤러 메서드의 실제 파라미터 어노테이션만 확인
  --> 인터페이스 어노테이션은 참조하지 않음

경로 2: Bean Validation 메서드 레벨 검증
  @Validated (클래스 레벨)
  --> MethodValidationPostProcessor가 AOP 프록시 생성
  --> Hibernate Validator가 타입 계층 전체 검사
  --> 인터페이스와 구현체 간 제약 일관성 요구
```

**경로 1**만 사용한다면 `@Valid`를 구현체에 두어도 동작한다.
하지만 **경로 2**(`@Validated`가 있는 경우)에서는 HV가 타입 계층을 검사하므로,
`@Valid`의 위치가 스펙 준수 여부를 결정한다.

| 시나리오 | @Valid 위치 | HV000151 | 검증 동작 |
|----------|-------------|----------|-----------|
| `@Validated` + 구현체 `@Valid` | 구현체만 | 발생 | -- |
| `@Validated` + 인터페이스 `@Valid` | 인터페이스만 | 안 발생 | HV가 인터페이스의 @Valid 상속하여 검증 |
| `@Validated` 없음 + 구현체 `@Valid @RequestBody` | 구현체만 | 안 발생 | Spring MVC가 직접 검증 |

결론: **`@Validated`와 인터페이스 패턴을 함께 사용한다면, `@Valid`는 반드시 인터페이스에 선언해야 한다.**
이는 "계약 관점에서 맞다"가 아니라 **"JSR 380 스펙이 요구한다"**는 것이다.

---

## 근본 원인

**Confidence: confirmed** (컴파일 검증 + 빌드 성공)

```
@Validated (클래스) + @Valid 없음 (인터페이스) + @Valid (구현체)
= 서브타입이 슈퍼타입에 없는 파라미터 제약을 추가
= ConstraintDeclarationException (HV000151)
= 클래스 전체 메타데이터 빌드 실패
= 6개 엔드포인트 전부 500
```

---

## 수정 사항

### 1. FriendshipV2ApiSpec.java (인터페이스) -- @Valid 추가

```diff
  import io.swagger.v3.oas.annotations.tags.Tag;
+ import jakarta.validation.Valid;

  @Tag(name = "FriendShip V2", description = "소셜 기능 관련 API")
  public interface FriendshipV2ApiSpec {
      // ...
      ResponseEntity<RsData<FriendshipResponse>> sendRequest(
          @Parameter(hidden = true) @CurrentMemberId Long memberId,
-         SendFriendRequestDto request
+         @Valid SendFriendRequestDto request
      );
```

### 2. FriendshipV2Controller.java (구현체) -- @Valid 제거

```diff
- import jakarta.validation.Valid;
  import lombok.RequiredArgsConstructor;

  @RestController
  @RequiredArgsConstructor
  @Validated
  public class FriendshipV2Controller implements FriendshipV2ApiSpec {
      // ...
      public ResponseEntity<RsData<FriendshipResponse>> sendRequest(
          @CurrentMemberId Long memberId,
-         @RequestBody @Valid SendFriendRequestDto request) {
+         @RequestBody SendFriendRequestDto request) {
```

수정 후 어노테이션 배치:

```
                         인터페이스                    컨트롤러

@Valid                   @Valid (검증 계약)           -- (상속)
@Parameter(hidden=true)  @Parameter (문서 계약)       -- (상속)
@CurrentMemberId         @CurrentMemberId             @CurrentMemberId
@RequestBody             --                           @RequestBody (바인딩)
@Validated               --                           @Validated (클래스 레벨)
```

`@Valid`와 `@Parameter`는 모두 인터페이스에서 **계약**을 명시하고,
`@RequestBody`와 `@Validated`는 구현체에서 **동작**을 처리한다.
처음에 제기되었던 "인터페이스에 두는 것이 맞지 않은가?"라는 반론이 정확했다.

---

## 교훈

- `@Validated` 클래스가 인터페이스를 구현하면, HV가 타입 계층 전체의 제약 일관성을 검사한다. `@Valid`를 구현체에만 선언하면 "서브타입이 제약을 추가했다"고 판단하여 HV000151이 발생한다.
- `@Valid`는 인터페이스에 선언해야 한다. 구현체는 인터페이스의 `@Valid`를 상속받아 검증을 수행한다. 이는 Jakarta Bean Validation 스펙(JSR 380)이 리스코프 치환 원칙에 기반하여 요구하는 사항이다.
- HV000151이 발생하면 에러가 난 메서드뿐 아니라 같은 컨트롤러의 **모든 엔드포인트**를 의심할 것. 클래스 단위 실패이므로.
- 처음에 "@Valid를 구현체로 옮기자"는 잘못된 수정을 적용했다가, git 히스토리 대조와 스펙 검증을 통해 **반대 방향**이 올바름을 확인했다. 수정 전 반드시 원본 코드의 의도와 스펙을 확인할 것.

---

## References

- [Jakarta Bean Validation 3.0 Spec](https://jakarta.ee/specifications/bean-validation/3.0/jakarta-bean-validation-spec-3.0.html) -- Jakarta Bean Validation 스펙 Section 5.6.5: 서브타입은 파라미터 제약을 추가할 수 없다
- [Jakarta EE Tutorial - Using Method Constraints in Type Hierarchies](https://docs.oracle.com/javaee/7/tutorial/bean-validation-advanced004.htm) -- LSP 기반 타입 계층 제약 규칙 설명
- [Quarkus Issue #35144](https://github.com/quarkusio/quarkus/issues/35144) -- HV000151은 인터페이스/구현체 간 제약 불일치 시 발생
- [Hibernate Validator GitHub - OverridingMethodMustNotAlterParameterConstraints.java](https://github.com/hibernate/hibernate-validator/blob/main/engine/src/main/java/org/hibernate/validator/internal/metadata/raw/ConstrainedExecutable.java) -- HV 소스: OverridingMethodMustNotAlterParameterConstraints가 HV000151 발생
- [Hibernate Validator GitHub - ConstrainedExecutable.java](https://github.com/hibernate/hibernate-validator/blob/main/engine/src/main/java/org/hibernate/validator/internal/metadata/raw/ConstrainedExecutable.java) -- HV 소스: isEquallyParameterConstrained()가 cascading 메타데이터(@Valid) 비교
- [Hibernate Validator GitHub - AbstractConstrainedElement.java](https://github.com/hibernate/hibernate-validator/blob/main/engine/src/main/java/org/hibernate/validator/internal/metadata/raw/AbstractConstrainedElement.java) -- HV 소스: isConstrained()의 첫 조건이 @Valid(cascading) 여부 확인
- [Reflectoring - Validation with Spring Boot](https://reflectoring.io/bean-validation-with-spring-boot/) -- @Validated 클래스에서 MethodValidationPostProcessor가 AOP 프록시 생성
- [Baeldung - @Valid vs @Validated](https://www.baeldung.com/spring-valid-vs-validated) -- @Valid vs @Validated의 차이 (메서드 레벨 vs 파라미터 레벨)
- [Spring Framework 6.0 Javadoc](https://docs.spring.vmware.com/spring-framework/docs/6.0.24/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/RequestResponseBodyMethodProcessor.html) -- RequestResponseBodyMethodProcessor가 @RequestBody + @Valid 처리
- [Hibernate Validator Reference Guide](https://docs.jboss.org/hibernate/stable/validator/reference/en-US/html_single/) -- Hibernate Validator 타입 계층 검증 규칙
- [Red Hat Solution 4235081](https://access.redhat.com/solutions/4235081) -- HV000151 Red Hat 공식 해결책
