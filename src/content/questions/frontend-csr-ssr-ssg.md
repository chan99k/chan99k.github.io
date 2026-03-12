---
title: "CSR, SSR, SSG의 차이와 각각의 사용 사례를 설명하세요"
answer: "CSR(Client-Side Rendering)은 클라이언트에서 JavaScript로 렌더링하며 초기 로딩이 느리지만 이후 페이지 전환이 빠릅니다. SSR(Server-Side Rendering)은 서버에서 HTML을 생성하여 전송하므로 SEO와 초기 로딩이 좋지만 서버 부하가 있습니다. SSG(Static Site Generation)는 빌드 타임에 HTML을 미리 생성하여 CDN으로 제공하므로 가장 빠르지만 동적 데이터는 제한적입니다. CSR은 관리자 페이지, SSR은 전자상거래, SSG는 블로그/문서 사이트에 적합합니다."
category: "frontend"
difficulty: "mid"
tags: ["렌더링", "SSR", "SEO"]
source: "curated"
hints: ["초기 로딩", "SEO", "서버 부하"]
---

## 해설

특징 비교:

| 특성 | CSR | SSR | SSG |
|------|-----|-----|-----|
| 초기 로딩 | 느림 | 빠름 | 가장 빠름 |
| SEO | 불리 | 유리 | 가장 유리 |
| 서버 부하 | 없음 | 높음 | 없음 |
| 동적 콘텐츠 | 유리 | 유리 | 불리 |

Next.js 렌더링 전략:
- SSG: getStaticProps (블로그 글)
- SSR: getServerSideProps (사용자별 대시보드)
- ISR(Incremental Static Regeneration): 주기적 재생성 (상품 목록)
- CSR: useEffect + API (검색 필터)

최근 트렌드: 하이브리드(SSG + CSR) - 정적 페이지 + 클라이언트 인터랙션
