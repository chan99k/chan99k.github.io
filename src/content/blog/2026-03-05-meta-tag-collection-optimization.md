---
title: "메타 태그 컬렉션 최적화: List에서 HashSet으로"
description: "제품 메타태그의 존재 여부를 확인하는 단순한 코드에서 출발해, Enum Strategy Pattern, HashSet, Skip-List, TreeSet까지 — 문제에 가장 적합한 자료구조를 선택하는 것이 왜 중요한지를 다룬다."
pubDate: "2026-03-05"
tags: ["Areas/개발/lang/Java", "Areas/개발/design-pattern"]
---

c-lab 은 C-Level 고객들이 필요한 모든 제품들을 정확하고 신속하게 제공해 주는 서비스이다. C-Level 고객들은 하나같이 본인만의 특별한 취향을 갖고 있기 때문에, c-lab 은 고객 맞춤형 서비스를 제공하기 위하여 최대한 상세하게 제품 태그를 관리하여야 할 필요성이 있다.

```java
public class MetaTag {
    final List<String> metaTagList = List.of("orange", "notebook", ...);

    public boolean containsMetaTag(String str) {
        for(String tag : metaTagList) {
            if(str.equals(tag)) return true;
        }
        return false;
    }

    ...
}
```

대충 위와 같은 형태의 제품의 메타정보를 태그의 형태로 저장하고, 특정 태그가 존재하는지 확인하는 메서드를 제공하는 클래스가 있다고 가정해 보자. 위 형태의 코드에는 어떤 문제가 있을까?

## Enum Strategy Pattern

먼저, 단순히 태그를 문자열로 저장하고 있는 것이 맘에 들지 않는다. Enum class 를 통해 태그를 표현하도록 변경하고, 더하여 태그의 종류에 따라 다른 행동이 요구될 가능성이 높다면 단순히 Y/N 를 확인하는 boolean 메서드를 활용하기보다는 Enum Strategy Pattern 을 통해 확장에 용이하도록 만드는 것이 좋지 않을까?

Enum Strategy Pattern은 각 Enum 상수가 자신만의 행동을 가질 수 있도록 하는 패턴이다. 단순히 상수를 정의하는 것을 넘어서, 각 상수마다 다른 비즈니스 로직을 캡슐화할 수 있다는 점에서 유용하다. 예를 들어 메타태그마다 다른 검증 로직이나 처리 방식이 필요하다면, if-else나 switch 문으로 분기하는 대신 각 Enum 상수에 해당 로직을 위임할 수 있다.

```java
public enum Category {
    FRUIT,
    ELECTRONICS,
    STATIONERY
}

public enum MetaTag {
    ORANGE {
        @Override
        public Category getCategory() {
            return Category.FRUIT;
        }
    },

    NOTEBOOK {
        @Override
        public Category getCategory() {
            return Category.ELECTRONICS;
        }
    },

    PENCIL {
        @Override
        public Category getCategory() {
            return Category.STATIONERY;
        }
    };

    // 이제 String이 아닌 Category Enum을 반환
    public abstract Category getCategory();
}

// 사용 예시
public class MetaTagService {
    public void processTag(MetaTag tag) {
        // 분기문 없이 각 태그의 카테고리를 가져올 수 있음
        Category category = tag.getCategory();
        System.out.println(tag + " belongs to " + category);
    }
}
```

이렇게 하면 새로운 메타태그 타입이 추가될 때마다 Enum에 상수만 추가하면 되고, 각 태그의 행동을 해당 Enum 상수 안에 캡슐화할 수 있어서 코드의 확장성과 유지보수성이 크게 향상된다. 다만, 이번 문제에서는 단순히 태그의 존재 여부만 확인하면 된다. 따라서 이 코드에서 지적해야 하는 문제 — 질문자의 의도 — 는 이것이 아니다.

## 진짜 문제: O(n) 탐색

음... 대충 멀쩡해 보이는 소스 코드인데 무슨 문제가 있을까?

다시 돌아와서, 주어진 코드를 한번 더 살펴보자.

```java
final List<String> metaTagList = List.of("orange", "notebook", ...);

public boolean containsMetaTag(String str) {
    for(String tag : metaTagList) {
        ...
```

c-lab이 성장하면서 메타태그가 수천 개로 늘어났다. 회사가 너무나 폭발적으로 성장하는 나머지, 관리하는 제품들의 metaTagList의 크기가 엄청나게 늘어나서 몇 천 개, 혹은 그 이상으로 증가한다고 가정해 보면 현재 코드는 O(n)으로 반복하기 때문에 그만큼의 성능 저하가 발생할 위험이 있다.

따라서 아래와 같이 O(1) 조회가 가능하도록 HashSet 을 사용하도록 변경해야 한다고 답변하는 것이 정확한 답변이다. HashSet을 사용하면 문자열의 해시값을 토대로 곧바로 존재 여부를 확인할 수 있다.

```java
final Set<String> metaTagSet = new HashSet<>(); // 메타 태그들을 해시셋에 추가

public boolean containsMetaTag(String str) {
    return metaTagSet.contains(str);
}
```

## 정렬이 필요하다면?

데이터를 정렬된 상태로 유지해야 한다면 Skip-List 나 TreeSet 등 다른 자료구조를 사용하여 메타태그를 저장해 볼 수도 있을 것이다. 메타 태그가 단순 문자열이 아니라 가중치 등을 가지고 정렬되어 있고, 그에 따라 구간 검색 등이 가능해야 하는 복잡한 조건이라면 HashSet을 사용할 수 없기 때문이다.

### Skip-List

Skip-List는 정렬된 연결 리스트를 기반으로 하되, 여러 레벨의 연결을 추가해서 빠른 검색을 가능하게 하는 확률적 자료구조다. 일반적인 연결 리스트는 특정 원소를 찾으려면 처음부터 끝까지 순회해야 하지만, Skip-List는 고속도로처럼 중간중간 빠른 경로를 만들어서 O(log n)의 검색 시간을 달성한다. 이진 탐색 트리와 비슷한 성능을 내면서도 구현이 더 단순하다는 장점이 있다.

핵심은 새로운 노드를 삽입할 때 동전 던지기와 같은 확률적 방법으로 그 노드가 몇 개의 레벨에 등장할지 결정한다는 점이다. 이렇게 무작위로 레벨을 결정하면 평균적으로 균형 잡힌 구조가 만들어지며, Red-Black Tree처럼 복잡한 회전 연산 없이도 O(log n)의 성능을 보장할 수 있다.

```java
import java.util.concurrent.ConcurrentSkipListSet;

// 계층 구조를 가진 메타태그 클래스
class HierarchicalTag implements Comparable<HierarchicalTag> {
    private final String category;
    private final String subCategory;
    private final int priority;

    public HierarchicalTag(String category, String subCategory, int priority) {
        this.category = category;
        this.subCategory = subCategory;
        this.priority = priority;
    }

    @Override
    public int compareTo(HierarchicalTag other) {
        // 1순위: 카테고리별로 정렬
        int categoryCompare = this.category.compareTo(other.category);

        if (categoryCompare != 0) return categoryCompare;

        // 2순위: 같은 카테고리 내에서는 우선순위로 정렬
        return Integer.compare(this.priority, other.priority);
    }

    @Override
    public String toString() {
        return category + "." + subCategory + "(priority:" + priority + ")";
    }

    public String getCategory() {
        return category;
    }
}

public class MetaTagManager {
    private final ConcurrentSkipListSet<HierarchicalTag> metaTagSet = new ConcurrentSkipListSet<>();

    public MetaTagManager() {
        metaTagSet.add(new HierarchicalTag("electronics", "gaming-laptop", 10));
        metaTagSet.add(new HierarchicalTag("electronics", "ultrabook", 5));
        metaTagSet.add(new HierarchicalTag("furniture", "desk", 3));
        metaTagSet.add(new HierarchicalTag("furniture", "chair", 7));
    }

    // 특정 카테고리의 모든 태그를 우선순위 순으로 조회
    public void printTagsByCategory(String category) {
        HierarchicalTag from = new HierarchicalTag(category, "", 0);
        HierarchicalTag to = new HierarchicalTag(category + Character.MAX_VALUE, "", 0);

        // "electronics" 조회 시: ultrabook(5), gaming-laptop(10) 순으로 출력
        metaTagSet.subSet(from, to).forEach(System.out::println);
    }
}
```

Skip-List는 메타태그가 카테고리별로 정렬되어 있어야 하고, 특정 카테고리의 하위 태그에 대해 범위 검색이나 순서 기반 조회가 필요할 때 유용할 것이다. 하지만 이번 문제처럼 단순히 특정 태그의 존재 여부만 확인하면 되는 상황에서는 정렬을 유지하는 오버헤드가 불필요하다. 게다가, ConcurrentSkipListSet은 thread-safe 한 대신에 그에 비례하여 동기화 비용이 발생할 것임에 주의하여야 한다.

### TreeSet

TreeSet은 자바에서 제공하는 정렬된 Set 구현체로, 내부적으로 Red-Black Tree라는 균형 이진 탐색 트리를 사용한다. 데이터가 항상 정렬된 상태로 유지되며, 삽입, 삭제, 검색 모두 O(log n)의 시간 복잡도를 가진다. 데이터의 순서를 유지해야 하거나 범위 검색이 필요한 경우에 적합하다.

```java
import java.util.TreeSet;
import java.util.Comparator;

public class MetaTagManager {
    private final TreeSet<HierarchicalTag> metaTagSet =
        new TreeSet<>(HierarchicalTag::compareTo);

    public MetaTagManager() {
        metaTagSet.add(new HierarchicalTag("electronics", "gaming-laptop", 10));
        metaTagSet.add(new HierarchicalTag("electronics", "ultrabook", 5));
        metaTagSet.add(new HierarchicalTag("furniture", "desk", 3));
        metaTagSet.add(new HierarchicalTag("furniture", "chair", 7));
    }

    // O(log n) 시간에 검색
    public boolean containsMetaTag(HierarchicalTag tag) {
        return metaTagSet.contains(tag);
    }

    // 특정 카테고리의 모든 태그를 우선순위 순으로 조회
    public void printTagsByCategory(String category) {
        HierarchicalTag from = new HierarchicalTag(category, "", 0);
        HierarchicalTag to = new HierarchicalTag(category + Character.MAX_VALUE, "", 0);

        // "electronics" 조회 시: ultrabook(5), gaming-laptop(10) 순으로 출력
        metaTagSet.subSet(from, to).forEach(System.out::println);
    }

    // 특정 우선순위 이상의 태그만 조회
    public void printHighPriorityTags(String category, int minPriority) {
        HierarchicalTag from = new HierarchicalTag(category, "", minPriority);
        HierarchicalTag to = new HierarchicalTag(
            category + Character.MAX_VALUE, "", Integer.MAX_VALUE);

        // "electronics"에서 우선순위 7 이상: gaming-laptop(10)만 출력
        metaTagSet.subSet(from, to).forEach(System.out::println);
    }
}
```

TreeSet 역시 메타태그에 우선순위나 가중치가 있고, 그 순서대로 처리해야 하거나 특정 범위의 태그들을 빈번하게 조회해야 하는 경우에 유용하다. 예를 들어 "프리미엄" 태그가 붙은 제품을 먼저 노출해야 한다거나, 특정 카테고리 범위 내의 태그들을 한 번에 가져와야 하는 요구사항이 있다면 TreeSet이 적합할 수 있다. 하지만 이번 문제처럼 단순히 "이 태그가 존재하는가?"만 확인하면 되는 상황에서는 정렬을 유지하는 비용이 불필요한 오버헤드가 된다.

## 마치며

하지만 문제의 의도는 HashSet 을 사용하는 게 정확했고, 아쉽게도 나는 바람을 쐬러 나온 직후에 깨달았다. 복잡한 자료구조를 아는 것도 중요하지만, 주어진 문제에 가장 적합한 해결책을 선택하는 것이 더 중요하지 않을까?
