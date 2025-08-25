// Core types for the personal website

export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  github: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
  description: string;
  technologies: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  period: string;
  teamSize: number;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  problems: ProblemSolution[];
}

export interface ProblemSolution {
  id: string;
  title: string;
  problem: string;
  solution: string;
  technologies: string[];
  projectId: string;
  slug: string;
  blogPostSlug?: string;
  isDetailedInBlog: boolean;
  excerpt?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  lastModified?: string;
  tags: string[];
  category: string;
  readingTime: number;
  excerpt: string;
  draft: boolean;
  featured: boolean;
  coverImage?: string;
  author: string;
  relatedProject?: string;
  isProblemSolution: boolean;
  problemSolutionMeta?: {
    problem: string;
    solution: string;
    technologies: string[];
  };
  // Advanced blog features
  series?: BlogSeries;
  seriesOrder?: number;
  relatedPosts?: string[]; // Array of related post slugs
  bookmarked?: boolean; // Client-side state
}

export interface BlogSeries {
  id: string;
  title: string;
  description: string;
  posts: BlogSeriesPost[];
  coverImage?: string;
  totalParts: number;
}

export interface BlogSeriesPost {
  slug: string;
  title: string;
  order: number;
  published: boolean;
}

export interface ReadingProgress {
  postSlug: string;
  progress: number; // 0-100
  lastReadAt: Date;
  completed: boolean;
}

export interface BookmarkedPost {
  slug: string;
  title: string;
  bookmarkedAt: Date;
  tags: string[];
  category: string;
}

export interface RelatedPostsConfig {
  maxRelated: number;
  tagWeight: number;
  categoryWeight: number;
  dateWeight: number;
  minScore: number;
}

export interface RestaurantReview {
  id: string;
  name: string;
  location: LocationData;
  rating: number;
  visitDate: string;
  cuisine: CuisineType;
  priceRange: PriceRange;
  images: ImageData[];
  review: string;
  tags: string[];
  mapLinks: MapLinks;
}

export interface LocationData {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  region: string;
}

export interface MapLinks {
  naver: string;
  kakao: string;
  google: string;
}

export interface ImageData {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export type CuisineType =
  | 'korean'
  | 'japanese'
  | 'chinese'
  | 'western'
  | 'italian'
  | 'thai'
  | 'vietnamese'
  | 'indian'
  | 'mexican'
  | 'other';

export type PriceRange = 1 | 2 | 3 | 4 | 5;

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
  url?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  period: string;
  gpa?: string;
}

export interface PortfolioData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  education: Education[];
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
}

export interface GiscusConfig {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number';
  reactionsEnabled: boolean;
  emitMetadata: boolean;
  inputPosition: 'top' | 'bottom';
  theme: string;
  lang: string;
}
