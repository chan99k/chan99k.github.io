export const SITE = {
  website: "https://chan99k.github.io/", // replace this with your deployed domain
  author: "chan99k",
  profile: "https://github.com/chan99k", // 프로필 링크
  desc: "chan99k's personal notes",      // 사이트 설명. <meta name="description">에 사용. 검색 엔진 결과에 표시되므로 SEO에 중요
  title: "chan99k's blog",                       // 사이트 제목
  ogImage: "astropaper-og.jpg", // 기본 OG(Open Graph) 이미지. SNS 공유 시 미리보기에 표시
  lightAndDarkMode: true,
  postPerIndex: 4, // 메인(홈) 페이지에 표시할 최근 포스트 수
  postPerPage: 7, // 페이지네이션 기준
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true, // 아카이브(연도별 포스트 목록) 페이지 표시 여부
  showBackButton: true, /// 포스트 상세 페이지에서 "뒤로가기" 버튼 표시 여부
  editPost: {
    enabled: true, // "Edit page" 링크 표시 여부
    text: "Edit page",
    url: "https://github.com/satnaing/astro-paper/edit/main/",  // 본인 저장소로 변경 필요, 예: "https://github.com/chan99k/blog/edit/main/"
  },
  dynamicOgImage: true, // 각 포스트별로 자동 OG 이미지 생성, 제목/설명 기반으로 이미지 자동 생성 (Satori 사용)
  dir: "ltr", // 텍스트 방향. "ltr"(왼쪽→오른쪽), "rtl"(오른쪽→왼쪽), "auto"
  lang: "ko", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Seoul", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
