# 개인 웹사이트

Next.js 14로 구축된 모던한 개인 웹사이트로, 포트폴리오 전시, 블로그 시스템, 맛집 리뷰 기능을 제공합니다.

## 🚀 주요 기능

- **포트폴리오 전시**: 프로젝트, 경험, 기술 스택 소개
- **블로그 시스템**: MDX 기반 블로그와 문법 하이라이팅
- **맛집 리뷰**: 위치 기반 리뷰와 지도 연동
- **문제-해결 카드**: 상세한 프로젝트 문제 해결 과정 문서화
- **다크/라이트 테마**: 시스템 설정 인식 테마 전환
- **정적 사이트 생성**: GitHub Pages 배포 최적화
- **반응형 디자인**: 모바일 우선 반응형 레이아웃
- **SEO 최적화**: 메타 태그, 사이트맵, RSS 피드

## 🛠️ 기술 스택

- **프레임워크**: Next.js 14 with App Router
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **콘텐츠**: MDX with remark/rehype plugins
- **애니메이션**: Framer Motion
- **아이콘**: Lucide React
- **배포**: GitHub Pages
- **CI/CD**: GitHub Actions

## 🚦 시작하기

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn

### 설치

1. 의존성 설치:

```bash
npm install
```

2. 개발 서버 실행:

```bash
npm run dev
```

3. 브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어주세요.

### 사용 가능한 스크립트

- `npm run dev` - 개발 서버 시작
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 시작
- `npm run lint` - ESLint 실행
- `npm run lint:fix` - ESLint 문제 자동 수정
- `npm run format` - Prettier로 코드 포맷팅
- `npm run format:check` - 코드 포맷팅 검사
- `npm run type-check` - TypeScript 타입 검사 실행

## 📁 프로젝트 구조

```
├── src/
│   ├── app/                 # Next.js app router 페이지
│   ├── components/          # React 컴포넌트
│   ├── lib/                 # 유틸리티 함수 및 설정
│   ├── types/               # TypeScript 타입 정의
│   ├── hooks/               # 커스텀 React 훅
│   ├── utils/               # 헬퍼 유틸리티
│   └── styles/              # 추가 스타일
├── content/                # 콘텐츠 파일
│   ├── portfolio/          # 포트폴리오 데이터
│   ├── blog/               # 블로그 포스트 (MDX)
│   └── reviews/            # 맛집 리뷰
├── public/                 # 정적 자산
│   ├── images/             # 콘텐츠 타입별 이미지
│   └── icons/              # 아이콘 자산
└── .kiro/                  # Kiro 스펙 파일
```

## 🚀 배포

이 프로젝트는 GitHub Actions를 통한 자동 CI/CD로 GitHub Pages에 배포되도록 구성되어 있습니다.

## 📄 라이선스

이 프로젝트는 오픈 소스이며 [MIT License](LICENSE) 하에 제공됩니다.

## 🤝 기여하기

기여, 이슈 제기, 기능 요청을 환영합니다!

## 📞 연락처

- GitHub: [@chan99k](https://github.com/chan99k)
- Email: your-email@example.com
