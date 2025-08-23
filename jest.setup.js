import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

// Mock matchMedia for next-themes (only in jsdom environment)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    disconnect() {}
    unobserve() {}
  };

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() {}
    disconnect() {}
    unobserve() {}
  };
}
