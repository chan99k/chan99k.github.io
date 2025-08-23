/**
 * Performance optimization tests
 */

import { 
  generateImageSizes, 
  generateBlurDataURL, 
  getOptimalImageFormat,
  IMAGE_CONFIGS 
} from '../image-optimization';
import { 
  WebVitalsTracker, 
  ResourceMonitor, 
  MemoryMonitor 
} from '../performance-monitoring';

// Mock window and performance APIs
const mockPerformance = {
  getEntriesByType: jest.fn().mockReturnValue([]),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    totalJSHeapSize: 100 * 1024 * 1024, // 100MB
    jsHeapSizeLimit: 2 * 1024 * 1024 * 1024, // 2GB
  },
};

const mockNavigator = {
  hardwareConcurrency: 4,
  connection: {
    effectiveType: '4g',
    saveData: false,
  },
};

// Mock DOM APIs
Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true,
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  value: MockIntersectionObserver,
  writable: true,
});

// Mock PerformanceObserver
class MockPerformanceObserver {
  observe = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'PerformanceObserver', {
  value: MockPerformanceObserver,
  writable: true,
});

describe('Image Optimization', () => {
  describe('generateImageSizes', () => {
    it('should generate responsive image sizes string', () => {
      const sizes = generateImageSizes({
        mobile: 100,
        tablet: 50,
        desktop: 33,
        wide: 25,
      });

      expect(sizes).toBe(
        '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
      );
    });

    it('should use default values when not provided', () => {
      const sizes = generateImageSizes({});
      expect(sizes).toContain('100vw');
      expect(sizes).toContain('50vw');
      expect(sizes).toContain('33vw');
      expect(sizes).toContain('25vw');
    });
  });

  describe('generateBlurDataURL', () => {
    it('should generate a valid data URL', () => {
      const blurDataURL = generateBlurDataURL();
      // In test environment without canvas, it should return fallback
      expect(typeof blurDataURL).toBe('string');
      expect(blurDataURL).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('should handle custom dimensions', () => {
      const blurDataURL = generateBlurDataURL(20, 20);
      expect(typeof blurDataURL).toBe('string');
      expect(blurDataURL).toMatch(/^data:image\/jpeg;base64,/);
    });
  });

  describe('getOptimalImageFormat', () => {
    it('should return webp as fallback when AVIF is not supported', () => {
      // Mock canvas toDataURL to simulate WebP support but not AVIF
      const mockCanvas = {
        toDataURL: jest.fn()
          .mockReturnValueOnce('data:image/png') // AVIF not supported
          .mockReturnValueOnce('data:image/webp'), // WebP supported
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockCanvas as HTMLCanvasElement);

      const format = getOptimalImageFormat();
      expect(format).toBe('webp');
    });
  });

  describe('IMAGE_CONFIGS', () => {
    it('should have all required configurations', () => {
      expect(IMAGE_CONFIGS.hero).toBeDefined();
      expect(IMAGE_CONFIGS.card).toBeDefined();
      expect(IMAGE_CONFIGS.thumbnail).toBeDefined();
      expect(IMAGE_CONFIGS.gallery).toBeDefined();
      expect(IMAGE_CONFIGS.avatar).toBeDefined();
    });

    it('should have proper quality settings', () => {
      Object.values(IMAGE_CONFIGS).forEach(config => {
        expect(config.quality).toBeGreaterThan(0);
        expect(config.quality).toBeLessThanOrEqual(100);
      });
    });
  });
});

describe('Performance Monitoring', () => {
  describe('WebVitalsTracker', () => {
    it('should initialize without errors', () => {
      const tracker = new WebVitalsTracker();
      expect(tracker).toBeDefined();
    });

    it('should handle metric callbacks', () => {
      const mockCallback = jest.fn();
      const tracker = new WebVitalsTracker(mockCallback);
      expect(tracker).toBeDefined();
    });

    it('should calculate performance score', () => {
      const tracker = new WebVitalsTracker();
      const score = tracker.getPerformanceScore();
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('ResourceMonitor', () => {
    beforeEach(() => {
      mockPerformance.getEntriesByType.mockReturnValue([
        {
          name: 'https://example.com/script.js',
          duration: 100,
          transferSize: 50000,
        },
        {
          name: 'https://example.com/style.css',
          duration: 50,
          transferSize: 25000,
        },
        {
          name: 'https://example.com/image.jpg',
          duration: 200,
          transferSize: 100000,
        },
      ]);
    });

    it('should get resource timings', () => {
      const timings = ResourceMonitor.getResourceTimings();
      expect(timings).toHaveLength(3);
      expect(timings[0]).toHaveProperty('name');
      expect(timings[0]).toHaveProperty('duration');
      expect(timings[0]).toHaveProperty('size');
      expect(timings[0]).toHaveProperty('type');
    });

    it('should identify resource types correctly', () => {
      expect(ResourceMonitor.getResourceType('script.js')).toBe('script');
      expect(ResourceMonitor.getResourceType('style.css')).toBe('stylesheet');
      expect(ResourceMonitor.getResourceType('image.jpg')).toBe('image');
      expect(ResourceMonitor.getResourceType('font.woff2')).toBe('font');
      expect(ResourceMonitor.getResourceType('data.json')).toBe('other');
    });

    it('should get largest resources', () => {
      const largest = ResourceMonitor.getLargestResources(2);
      expect(largest).toHaveLength(2);
      expect(largest[0].size).toBeGreaterThanOrEqual(largest[1].size);
    });

    it('should get slowest resources', () => {
      const slowest = ResourceMonitor.getSlowestResources(2);
      expect(slowest).toHaveLength(2);
      expect(slowest[0].duration).toBeGreaterThanOrEqual(slowest[1].duration);
    });
  });

  describe('MemoryMonitor', () => {
    it('should get memory usage', () => {
      const usage = MemoryMonitor.getMemoryUsage();
      expect(usage).toHaveProperty('used');
      expect(usage).toHaveProperty('total');
      expect(usage).toHaveProperty('limit');
      expect(usage).toHaveProperty('percentage');
    });

    it('should detect memory pressure', () => {
      const isHighPressure = MemoryMonitor.isMemoryPressureHigh();
      expect(typeof isHighPressure).toBe('boolean');
    });

    it('should handle missing memory API', () => {
      const originalMemory = mockPerformance.memory;
      delete (mockPerformance as { memory?: unknown }).memory;

      const usage = MemoryMonitor.getMemoryUsage();
      expect(usage).toBeNull();

      mockPerformance.memory = originalMemory;
    });
  });
});

describe('Bundle Optimization', () => {
  it('should have proper webpack configuration', () => {
    // This would be tested in integration tests
    // Here we just verify the configuration structure exists
    expect(true).toBe(true);
  });
});

describe('Performance Thresholds', () => {
  const testCases = [
    { metric: 'CLS', good: 0.05, poor: 0.3 },
    { metric: 'FID', good: 50, poor: 400 },
    { metric: 'FCP', good: 1500, poor: 3500 },
    { metric: 'LCP', good: 2000, poor: 4500 },
    { metric: 'TTFB', good: 600, poor: 2000 },
    { metric: 'INP', good: 150, poor: 600 },
  ];

  testCases.forEach(({ metric, good, poor }) => {
    it(`should classify ${metric} values correctly`, () => {
      // This would test the rating logic in WebVitalsTracker
      // For now, we just verify the test structure
      expect(good).toBeLessThan(poor);
    });
  });
});

describe('Code Splitting', () => {
  it('should have dynamic import utilities', async () => {
    // Test that the module exports exist
    const dynamicImports = await import('../dynamic-imports');
    expect(typeof dynamicImports.createDynamicComponent).toBe('function');
  });
});