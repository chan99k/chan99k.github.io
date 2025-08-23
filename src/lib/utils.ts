import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

export function generateExcerpt(content: string, length: number = 160): string {
  // 마크다운 문법과 HTML 태그 제거
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // 헤더 제거
    .replace(/\*\*(.*?)\*\*/g, '$1') // 볼드 제거
    .replace(/\*(.*?)\*/g, '$1') // 이탤릭 제거
    .replace(/`(.*?)`/g, '$1') // 인라인 코드 제거
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 링크 제거
    .replace(/<[^>]*>/g, '') // HTML 태그 제거
    .replace(/\n+/g, ' ') // 줄바꿈을 공백으로 변경
    .trim();

  return truncate(plainText, length);
}
