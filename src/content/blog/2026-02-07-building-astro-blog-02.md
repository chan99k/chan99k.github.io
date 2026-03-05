---
title: "Astro 블로그 고도화: PARA 태그 체계, 그래프 뷰, SEO, 광고까지"
description: "PARA 방법론 기반 계층형 태그 시스템, sigma.js 네트워크 그래프 뷰, 검색엔진 최적화, Google AdSense 설정까지 — Astro 블로그를 본격적인 기술 블로그로 확장한 과정을 공유합니다."
pubDate: "2026-03-05"
tags: ["Areas/개발/frontend/Astro", "Areas/개발/lang/TypeScript", "Areas/infra"]
project: "chan99k-blog"
---

시리즈 01에서 Astro 블로그의 기본 골격을 구축했습니다. 이번 글에서는 본격적인 기술 블로그로 확장하기 위해 추가한 기능들을 다룹니다. PARA 방법론 기반의 체계적인 태그 시스템, Obsidian 스타일의 네트워크 그래프 뷰, 검색엔진 최적화, 그리고 Google AdSense 설정까지 실제 코드와 의사결정 과정을 공유합니다.

## PARA 기반 태그 체계 구축

### 기존 태그 시스템의 한계

시리즈 01에서 구현한 계층형 태그 시스템은 `/` 구분자로 자유롭게 계층을 만들 수 있었습니다. 하지만 실제 운영하면서 문제가 보였습니다.

```
개발/React          # 이게 맞나?
Areas/개발/React    # 아니면 이게 맞나?
기술/React          # 아니면 이건?
```

자유형 태그는 일관성을 유지하기 어렵습니다. 오타나 표기 차이로 같은 의도의 태그가 분산됩니다. 태그가 많아질수록 관리가 불가능해집니다.

### PARA 방법론 도입

Tiago Forte의 PARA 방법론을 태그 체계의 1tier로 채택했습니다.

```
Projects  - 기한이 있는 프로젝트 (chan99k-blog, 사이드프로젝트)
Areas     - 지속적인 관심사 (개발, 생산성, AI)
Resources - 참고자료 (북마크, 번역문서)
Archives  - 완료/중단된 항목
```

PARA를 선택한 이유는 세 가지입니다:

**1. 명확한 분류 기준**

프로젝트와 관심사의 구분이 명확합니다. "기한이 있으면 Projects, 지속적이면 Areas"라는 단순한 규칙으로 태그를 할당할 수 있습니다.

**2. 검색 효율성**

PARA 1tier 필터링으로 노이즈를 줄입니다. "Areas/"로 시작하는 태그만 보면 지식베이스가 되고, "Projects/"로 시작하는 태그만 보면 프로젝트 히스토리가 됩니다.

**3. 확장성**

새로운 관심사가 생겨도 "Areas/"에 추가하면 됩니다. 태그 체계 전체를 재설계할 필요가 없습니다.

### 3-Tier 태그 구조

최종 설계는 **사전정의 2tier + 자유형 3tier** 구조입니다:

```
Areas/개발/frontend/Astro     # 1tier: PARA
      ↑    ↑       ↑
      사전정의 2tier   자유형 3tier
```

**1tier (PARA)**: 고정 (Projects/Areas/Resources/Archives)
**2tier**: 주요 관심사는 사전정의 (개발, 생산성, AI, 인프라 등)
**3tier**: 자유형 (새로운 기술이나 세부 주제)

이렇게 하면 일관성을 유지하면서도 유연성을 확보할 수 있습니다.

### 단일 진실 공급원: tag-taxonomy.ts

태그 정의를 한 곳에 모았습니다.

```typescript
// src/data/tag-taxonomy.ts
export interface Tier1Category {
    color: TierColor;
    children: string[];
}

export const TAG_TAXONOMY = {
    Projects: {
        color: 'teal',
        children: ['blogs', 'giftify'],
    },
    Areas: {
        color: 'blue',
        children: ['개발', 'architecture', 'infra'],
    },
    Resources: {
        color: 'amber',
        children: ['translations'],
    },
    Archives: {
        color: 'rose',
        children: ['til', 'thoughts'],
    },
} as const satisfies Record<string, Tier1Category>;
```

`as const satisfies` 패턴으로 타입 안전성을 확보했습니다. TypeScript가 리터럴 타입을 유지하면서도 `Record<string, Tier1Category>` 인터페이스를 만족하는지 검증합니다. 각 PARA 카테고리에 고유 색상을 부여하고, 2tier 자식 태그를 배열로 관리합니다.

이 파일에서 `Tier1Name`과 `Tier2Name` 타입을 추출합니다:

```typescript
export type Tier1Name = keyof typeof TAG_TAXONOMY;
// "Projects" | "Areas" | "Resources" | "Archives"

export type Tier2Name = typeof TAG_TAXONOMY[Tier1Name]['children'][number];
// "blogs" | "giftify" | "개발" | "architecture" | "infra" | "translations" | ...
```

### Zod 빌드타임 유효성 검증

Content Collections 스키마에 태그 검증을 추가했습니다.

```typescript
// src/content/config.ts
import { TAG_TAXONOMY } from '../data/tag-taxonomy';

const tagSchema = z.array(z.string()).default([]).superRefine((tags, ctx) => {
    const tier1Names = Object.keys(TAG_TAXONOMY);
    for (const tag of tags) {
        const segments = tag.split('/');
        const tier1 = segments[0];

        // 1tier 검증
        if (!tier1Names.includes(tier1)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Invalid 1tier tag "${tier1}". Must be one of: ${tier1Names.join(', ')}`,
            });
            continue;
        }

        // 2tier 검증
        if (segments.length >= 2) {
            const tier2 = segments[1];
            const validTier2 = TAG_TAXONOMY[tier1].children;
            if (!validTier2.includes(tier2)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Invalid 2tier tag "${tier2}" under "${tier1}". Must be one of: ${validTier2.join(', ')}`,
                });
            }
        }
        // 3tier+ is free-form — no validation
    }
});

const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        tags: tagSchema,
        // ...
    }),
});
```

핵심은 `tagSchema`를 별도로 분리해서 `superRefine`을 체이닝한 것입니다. Zod의 `superRefine`은 커스텀 검증 훅으로, 빌드 시점에 잘못된 태그를 찾아냅니다.

```bash
# 빌드 실패 예시
[content] Invalid tier-1 tag: Areass
    in src/content/blog/example.md
```

Decap CMS에서 태그를 잘못 입력하면 빌드가 실패합니다. 잘못된 태그가 프로덕션에 올라가는 것을 원천 차단합니다.

### 타입 안전성

유틸리티 함수도 타입 추론이 됩니다.

```typescript
// src/utils/tags.ts
export function getTier1(tag: string): Tier1Name | null {
    const tier1 = tag.split('/')[0];
    return isValidTier1(tier1) ? tier1 : null;
}

// 사용 예시
const tier1 = getTier1('Areas/개발/frontend');
// 타입: "Projects" | "Areas" | "Resources" | "Archives" | null
```

IDE에서 자동완성도 지원됩니다. PARA 태그를 입력할 때 오타를 즉시 잡아줍니다.

---

## sigma.js 기반 Obsidian 스타일 태그 그래프 뷰

### D3.js에서 sigma.js로 전환

처음엔 D3.js force layout으로 그래프를 만들었습니다. 하지만 인터랙션 구현이 복잡했습니다. D3는 저수준 API라 호버, 드래그, 줌 등을 전부 직접 구현해야 했습니다.

sigma.js는 그래프 렌더링에 특화된 라이브러리입니다. WebGL 기반이라 수천 개 노드도 부드럽게 렌더링됩니다. React 바인딩인 `@react-sigma/core`를 쓰면 React에서 선언적으로 그래프를 구성할 수 있습니다.

### graphology + ForceAtlas2 레이아웃

sigma.js는 `graphology`를 그래프 데이터 구조로 사용합니다.

```typescript
// src/components/TagGraph.tsx
import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';

// PARA 카테고리별 초기 클러스터 위치 — 겹침 방지
const PARA_CENTERS: Record<string, { x: number; y: number }> = {
    Areas:     { x: 0,   y: 0 },
    Resources: { x: 80,  y: -40 },
    Archives:  { x: 80,  y: 40 },
    Projects:  { x: -80, y: 0 },
};

const graph = new Graph();

// 2tier+ 노드만 추가 (1tier는 배경 hull 영역으로)
for (const node of data.nodes) {
    if (node.tier === 1) continue;
    const para = node.id.split('/')[0];
    const center = PARA_CENTERS[para] ?? { x: 0, y: 0 };
    // PARA 중심 좌표에 랜덤 산포
    const angle = Math.random() * Math.PI * 2;
    const radius = 8 + Math.random() * 15;
    graph.addNode(node.id, {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
        size: nodeSize(node.tier, node.count),
        label: node.id.split('/').pop()!,
        color: hexForColor(node.color, dark),
    });
}

// ForceAtlas2 — 100회 사전 시뮬레이션으로 안정된 레이아웃 확보
forceAtlas2.assign(graph, {
    iterations: 100,
    settings: {
        gravity: 3,
        scalingRatio: 8,
        barnesHutOptimize: true,
        adjustSizes: true,
    },
});
```

ForceAtlas2는 네트워크 그래프 레이아웃 알고리즘입니다. 노드 간 인력/척력을 시뮬레이션해서 자연스러운 클러스터링을 만듭니다. Gephi, Obsidian 등에서 사용하는 알고리즘입니다. `PARA_CENTERS`로 초기 위치를 미리 분산시키면 같은 PARA 카테고리끼리 자연스럽게 뭉칩니다.

### PARA 카테고리별 Convex Hull "세포막"

같은 PARA 카테고리끼리 시각적으로 그룹핑하고 싶었습니다. Convex Hull(볼록 껍질) 알고리즘으로 노드를 둘러싼 영역을 그렸습니다.

d3-polygon을 쓸 수도 있지만, 노드가 1-2개일 때도 안정적으로 동작하도록 **Andrew's Monotone Chain** 알고리즘을 직접 구현했습니다. 핵심 아이디어는 각 노드 주위에 원형 패딩 포인트를 생성한 뒤 Convex Hull을 계산하는 것입니다.

```typescript
// 각 노드 중심에 8개 패딩 포인트 생성 → Convex Hull 계산
function paddedHull(centers: Pt[], padding: number): Pt[] {
    const expanded: Pt[] = [];
    for (const [cx, cy] of centers) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            expanded.push([
                cx + Math.cos(angle) * padding,
                cy + Math.sin(angle) * padding,
            ]);
        }
    }
    return convexHull(expanded); // Andrew's monotone chain
}
```

Hull 렌더링은 sigma.js의 `afterRender` 이벤트에 연결합니다. 별도 Canvas 레이어를 sigma 위에 올려서 `graphToViewport`로 좌표를 변환합니다.

```typescript
function HullOverlay({ dark, canvasRef }) {
    const sigma = useSigma();

    useEffect(() => {
        const handler = () => {
            const graph = sigma.getGraph();
            // PARA 카테고리별 노드 좌표를 viewport 좌표로 변환
            const groups = new Map();
            graph.forEachNode((nodeId, attrs) => {
                const pos = sigma.graphToViewport({ x: attrs.x, y: attrs.y });
                // ... group by PARA category
            });

            // Hull 그리기 (투명 fill + 연한 stroke)
            for (const [para, { points, color }] of groups) {
                const hull = paddedHull(points, 40);
                drawSmoothHull(ctx, hull); // quadraticCurveTo로 부드러운 곡선
                ctx.fillStyle = hex + '0f'; // ~6% opacity
                ctx.fill();
            }
        };

        sigma.on('afterRender', handler);
        return () => sigma.off('afterRender', handler);
    }, [sigma, dark]);
}
```

`afterRender`에 바인딩하면 줌/패닝할 때마다 Hull이 함께 움직입니다.

### 호버 인터랙션: 연결 노드 강조 + 비연결 Dimming

노드에 마우스를 올리면 연결된 노드만 강조하고 나머지는 흐리게 만듭니다.

sigma.js의 `nodeReducer`/`edgeReducer`를 사용하면 원본 데이터를 변경하지 않고 렌더링만 바꿀 수 있습니다.

```typescript
function GraphInteractions() {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    const registerEvents = useRegisterEvents();
    const setSettings = useSetSettings();
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    useEffect(() => {
        registerEvents({
            enterNode: (e) => setHoveredNode(e.node),
            leaveNode: () => setHoveredNode(null),
            clickNode: (e) => {
                const slug = e.node.split('/').map(encodeURIComponent).join('/');
                window.location.href = `/tags/${slug}/`;
            },
        });
    }, [registerEvents, sigma, graph]);

    useEffect(() => {
        if (!hoveredNode) {
            setSettings({ nodeReducer: undefined, edgeReducer: undefined });
            return;
        }

        const neighbors = new Set(graph.neighbors(hoveredNode));
        neighbors.add(hoveredNode);

        setSettings({
            nodeReducer: (node, data) => {
                if (neighbors.has(node)) {
                    return { ...data, highlighted: true, zIndex: 1 };
                }
                // dimming: 회색 + 라벨 숨김
                return { ...data, color: '#94a3b8', label: '', zIndex: 0 };
            },
            edgeReducer: (edge, data) => {
                const source = graph.source(edge);
                const target = graph.target(edge);
                if (neighbors.has(source) && neighbors.has(target)) {
                    return { ...data, size: (data.size ?? 1) * 2, zIndex: 1 };
                }
                return { ...data, color: 'rgba(148,163,184,0.08)', zIndex: 0 };
            },
        });
    }, [hoveredNode, setSettings, graph]);

    return null;
}
```

`nodeReducer`는 실제 그래프 데이터를 변경하지 않고 렌더링 시점에만 속성을 오버라이드합니다. 호버를 해제하면 `undefined`로 리셋하면 원래 상태로 돌아갑니다. 직접 `setNodeAttribute`을 호출하는 것보다 훨씬 깔끔합니다.

### client:only="react"로 SSR 회피

sigma.js는 WebGL을 사용합니다. Node.js에는 WebGL이 없어서 SSR에서 실패합니다.

```astro
<!-- src/pages/graph.astro -->
<Layout>
    <TagGraph client:only="react" />
</Layout>
```

`client:only="react"`는 서버에서는 아예 렌더링하지 않고 클라이언트에서만 React 컴포넌트를 로드합니다. SSR을 완전히 건너뜁니다.

---

## 검색엔진 최적화 (SEO)

### @astrojs/sitemap으로 sitemap.xml 자동 생성

```bash
npm install @astrojs/sitemap
```

```javascript
// astro.config.mjs
export default defineConfig({
    site: 'https://blog.chan99k.dev',
    integrations: [
        react(),
        sitemap({
            filter: (page) =>
                !page.includes('/admin/') &&
                !page.includes('/oauth/'),
        }),
    ],
});
```

빌드 시 `dist/sitemap-index.xml`과 `dist/sitemap-0.xml`이 생성됩니다. 포스트가 많아지면 자동으로 여러 sitemap 파일로 분할됩니다.

### robots.txt

```text
# public/robots.txt
User-agent: *
Allow: /

Sitemap: https://blog.chan99k.dev/sitemap-index.xml
```

간단하지만 필수입니다. 검색 봇에게 사이트맵 위치를 알려줍니다.

### Canonical URL 메타 태그

```astro
<!-- src/layouts/Layout.astro -->
---
const canonicalURL = new URL(Astro.url.pathname, Astro.site).href;
---

<head>
    <link rel="canonical" href={canonicalURL} />
    <meta property="og:url" content={canonicalURL} />
</head>
```

중복 콘텐츠 문제를 방지합니다. 같은 글이 여러 URL에서 접근 가능할 때 검색엔진에게 정규 URL을 알려줍니다.

### Google Search Console DNS TXT 인증

1. Google Search Console에서 도메인 속성 추가
2. DNS TXT 레코드 추가 (Cloudflare 기준):
   ```
   Type: TXT
   Name: @
   Content: google-site-verification=xxxxxxxxxxxxx
   ```
3. DNS 전파 대기 (최대 48시간, 보통 몇 분)
4. Search Console에서 확인 클릭

인증되면 Search Console 대시보드에서 인덱싱 상태, 검색 쿼리, 클릭 수 등을 볼 수 있습니다.

---

## Google AdSense 설정

### 환경변수 기반 조건부 렌더링

광고는 로컬 개발에서는 표시하지 않고 프로덕션에만 표시합니다.

Astro는 `PUBLIC_` 접두사가 붙은 환경변수를 `import.meta.env`로 자동 노출합니다. 별도 Vite 설정이 필요 없습니다.

```astro
<!-- src/layouts/Layout.astro <head> 내부 -->
{import.meta.env.PUBLIC_ADSENSE_CLIENT_ID && (
    <>
        <meta name="google-adsense-account"
              content={import.meta.env.PUBLIC_ADSENSE_CLIENT_ID} />
        <script async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${import.meta.env.PUBLIC_ADSENSE_CLIENT_ID}`}
            crossorigin="anonymous">
        </script>
    </>
)}
```

Netlify 환경변수에 `PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx`만 등록하면 빌드 시 자동 주입됩니다. 로컬에서는 `.env` 파일이 없으면 조건부 렌더링이 건너뛰어져 광고가 표시되지 않습니다.

### ads.txt

```text
# public/ads.txt
google.com, pub-xxxxxxxxxx, DIRECT, f08c47fec0942fa0
```

AdSense 대시보드에서 제공하는 내용을 그대로 복사합니다. 광고 인벤토리 무단 사용을 방지합니다.

### 계정 인증 meta 태그

```astro
<!-- src/layouts/Layout.astro -->
<head>
    <meta name="google-adsense-account"
          content="ca-pub-xxxxxxxxxx">
</head>
```

AdSense 승인 과정에서 필요한 태그입니다.

### 광고 배치: 포스트 본문 하단 ~ 댓글 사이

```astro
<!-- src/pages/blog/[...slug].astro -->
<article>
    <Markdown content={post.body} />
</article>

<div class="my-12">
    <AdSense />
</div>

<Giscus client:visible />
```

본문 바로 아래는 너무 침입적입니다. 사용자가 글을 다 읽고 댓글로 넘어가기 전에 한 번 노출되는 것이 자연스럽습니다.

---

## 콘텐츠 가독성 개선

### 문단 첫 줄 들여쓰기

```css
/* src/styles/globals.css */
.prose :where(p) {
    text-indent: 1em;
}

/* 제목 직후, blockquote 내부, 리스트 내부 문단은 들여쓰기 제외 */
.prose :where(p):first-child,
.prose :where(h2, h3, h4) + p,
.prose :where(blockquote) p,
.prose :where(li) p {
    text-indent: 0;
}
```

한국어 타이포그래피에서 문단 들여쓰기는 가독성을 높입니다. 특히 긴 글에서 문단 구분이 명확해집니다.

### blockquote 스타일

```css
.prose :where(blockquote) {
    @apply border-l-4 border-accent/40 pl-5 text-gray-600;
    font-style: normal;
}

.dark .prose :where(blockquote) {
    @apply text-gray-400 border-accent/30;
}
```

Tailwind의 `@apply`와 CSS nesting으로 라이트/다크 모드 모두 대응합니다. `font-style: normal`로 기본 이탤릭을 해제하고, accent 색상 40% 투명도의 좌측 보더로 인용구를 강조합니다.

### Programmers 테마 영감의 다크모드

Programmers 코딩테스트 플랫폼의 다크 navy 테마를 참고했습니다.

```css
@theme {
    --color-navy-800: #2B3040;
    --color-navy-900: #1E2231;
    --color-navy-950: #171C2A;
    --color-accent: #0078FF;
}
```

순수 검정(`#000000`)보다 navy 계열(`#171C2A`)이 눈에 덜 피로합니다. Programmers 코딩테스트 사이트의 navy 배경에서 영감을 받았고, 코드 하이라이팅 색상과의 대비도 좋습니다.

---

## 프로젝트 구조 변화

시리즈 01 대비 추가된 주요 파일들:

```
src/
├── data/
│   └── tag-taxonomy.ts       # PARA 태그 정의 + Tier1Name/Tier2Name 타입
├── components/
│   ├── TagGraph.tsx          # sigma.js 그래프 뷰 (React)
│   └── AdUnit.astro          # Google AdSense 광고 컴포넌트
├── pages/
│   ├── tags/index.astro      # 태그 목록 + 그래프 뷰
│   └── api/tags-graph.json.ts # 그래프 데이터 JSON 엔드포인트
├── styles/
│   └── globals.css           # 가독성 스타일 (들여쓰기, blockquote)
└── utils/
    └── tags.ts               # 태그 유틸 + 그래프 데이터 생성
public/
├── robots.txt                # 검색 봇 가이드
└── ads.txt                   # AdSense 인벤토리 인증
```

---

## 배운 점

**태그 체계는 처음부터 엄격하게 관리해야 합니다.** 자유형 태그로 시작하면 나중에 정리가 불가능합니다. PARA 같은 검증된 프레임워크를 먼저 도입하고, 그 안에서 확장하는 것이 지속 가능합니다.

**Zod superRefine은 복잡한 검증에 유용합니다.** Content Collections의 기본 스키마로는 계층형 태그 검증이 어렵습니다. `superRefine`으로 커스텀 로직을 추가하면 빌드 시점에 모든 규칙을 강제할 수 있습니다.

**sigma.js는 그래프 전용 라이브러리입니다.** D3.js는 범용 시각화 라이브러리라 그래프 인터랙션을 직접 구현해야 합니다. sigma.js는 호버, 드래그, 줌 등이 기본 제공되고 WebGL이라 성능도 좋습니다.

**client:only는 SSR 호환 문제의 탈출구입니다.** WebGL, Canvas 같은 브라우저 전용 API를 쓸 때는 SSR을 건너뛰는 것이 정답입니다. 성능 손실도 크지 않습니다.

**SEO는 기술보다 콘텐츠입니다.** sitemap, robots.txt, canonical URL 등은 30분이면 끝납니다. 실제 검색 순위는 콘텐츠 품질과 업데이트 빈도가 결정합니다.

**AdSense는 환경변수로 분리해야 합니다.** 로컬 개발에서 광고 스크립트가 로드되면 디버깅이 어렵습니다. 프로덕션 전용 기능은 반드시 환경변수로 제어해야 합니다.

**다크모드는 순수 검정을 피해야 합니다.** `#000000`은 너무 강렬합니다. navy 계열(`#1a1f35`)이 눈에 훨씬 편안하고 전문적으로 보입니다.
