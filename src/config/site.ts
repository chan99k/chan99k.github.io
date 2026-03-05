export const SITE = {
  // Core
  name: "chan99k",
  title: "chan99k's blog",
  description: "chan99k의 개인 블로그 및 포트폴리오입니다.",
  url: "https://blog.chan99k.dev",

  // Social
  social: {
    github: "https://github.com/chan99k",
    linkedin: "https://www.linkedin.com/in/chan99",
  },

  // Giscus comments
  giscus: {
    repo: "chan99k/chan99k.github.io" as `${string}/${string}`,
    repoId: "R_kgDOQ8vEGQ",
    category: "General",
    categoryId: "DIC_kwDOQ8vEGc4C1tdV",
  },

  // CMS
  cms: {
    repo: "chan99k/chan99k.github.io",
  },
} as const;
