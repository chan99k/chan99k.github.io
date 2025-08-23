import { cn, formatDate, slugify, truncateText, getReadingTime } from '../utils';

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    });

    it('should handle conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class');
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class');
    });

    it('should handle undefined and null values', () => {
      expect(cn('base-class', undefined, null)).toBe('base-class');
    });

    it('should override conflicting Tailwind classes', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
      expect(cn('p-4', 'px-2')).toBe('p-4 px-2');
    });
  });

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBe('2024년 1월 15일');
    });

    it('should format Date object correctly', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toBe('2024년 1월 15일');
    });

    it('should handle custom locale', () => {
      const result = formatDate('2024-01-15', 'en-US');
      expect(result).toBe('January 15, 2024');
    });

    it('should handle invalid date', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('slugify', () => {
    it('should convert text to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('React와 TypeScript')).toBe('react와-typescript');
    });

    it('should handle special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world');
      expect(slugify('Test@#$%^&*()')).toBe('test');
    });

    it('should handle multiple spaces', () => {
      expect(slugify('Hello    World')).toBe('hello-world');
    });

    it('should handle Korean text', () => {
      expect(slugify('안녕하세요 세계')).toBe('안녕하세요-세계');
    });

    it('should handle empty string', () => {
      expect(slugify('')).toBe('');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long...');
    });

    it('should not truncate short text', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });

    it('should handle custom suffix', () => {
      const longText = 'This is a very long text';
      expect(truncateText(longText, 10, ' [more]')).toBe('This is a [more]');
    });

    it('should handle empty string', () => {
      expect(truncateText('', 10)).toBe('');
    });
  });

  describe('getReadingTime', () => {
    it('should calculate reading time correctly', () => {
      const text = 'word '.repeat(200); // 200 words
      expect(getReadingTime(text)).toBe(1); // ~1 minute at 200 WPM
    });

    it('should handle short text', () => {
      const text = 'Short text';
      expect(getReadingTime(text)).toBe(1); // Minimum 1 minute
    });

    it('should handle long text', () => {
      const text = 'word '.repeat(1000); // 1000 words
      expect(getReadingTime(text)).toBe(5); // ~5 minutes at 200 WPM
    });

    it('should handle empty string', () => {
      expect(getReadingTime('')).toBe(1);
    });

    it('should handle markdown content', () => {
      const markdownText = `
        # Heading
        
        This is a **bold** text with *italic* and \`code\`.
        
        \`\`\`javascript
        console.log('Hello, world!');
        \`\`\`
        
        - List item 1
        - List item 2
      `;
      const readingTime = getReadingTime(markdownText);
      expect(readingTime).toBeGreaterThan(0);
    });
  });
});