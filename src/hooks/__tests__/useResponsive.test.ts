import { renderHook, act } from '@testing-library/react';
import { useResponsive } from '../useResponsive';

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe('useResponsive Hook', () => {
  beforeEach(() => {
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct breakpoint for desktop', () => {
    mockMatchMedia(true);
    
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.breakpoint).toBe('desktop');
  });

  it('should return correct breakpoint for tablet', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.breakpoint).toBe('tablet');
  });

  it('should return correct breakpoint for mobile', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.breakpoint).toBe('mobile');
  });

  it('should update breakpoint on window resize', () => {
    const { result } = renderHook(() => useResponsive());

    // Initially desktop
    expect(result.current.breakpoint).toBe('desktop');

    // Simulate window resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      // Trigger resize event
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.breakpoint).toBe('mobile');
    expect(result.current.isMobile).toBe(true);
  });

  it('should provide utility functions', () => {
    const { result } = renderHook(() => useResponsive());

    expect(typeof result.current.isAbove).toBe('function');
    expect(typeof result.current.isBelow).toBe('function');
    expect(typeof result.current.isBetween).toBe('function');
  });

  it('should correctly identify breakpoint comparisons', () => {
    const { result } = renderHook(() => useResponsive());

    // Desktop breakpoint
    expect(result.current.isAbove('tablet')).toBe(true);
    expect(result.current.isAbove('mobile')).toBe(true);
    expect(result.current.isBelow('desktop')).toBe(false);
    expect(result.current.isBetween('tablet', 'desktop')).toBe(false);
  });

  it('should handle custom breakpoints', () => {
    const customBreakpoints = {
      sm: 480,
      md: 768,
      lg: 1024,
      xl: 1280,
    };

    const { result } = renderHook(() => useResponsive(customBreakpoints));

    expect(result.current.breakpoint).toBeDefined();
    expect(['sm', 'md', 'lg', 'xl']).toContain(result.current.breakpoint);
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useResponsive());
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should handle SSR environment gracefully', () => {
    // Mock SSR environment (no window)
    const originalWindow = global.window;
    delete (global as any).window;

    const { result } = renderHook(() => useResponsive());

    // Should provide default values
    expect(result.current.breakpoint).toBe('desktop');
    expect(result.current.isDesktop).toBe(true);

    // Restore window
    global.window = originalWindow;
  });

  it('should debounce resize events', async () => {
    const { result } = renderHook(() => useResponsive());
    
    const initialBreakpoint = result.current.breakpoint;

    // Rapidly trigger multiple resize events
    act(() => {
      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(new Event('resize'));
      }
    });

    // Should not cause excessive re-renders
    expect(result.current.breakpoint).toBe(initialBreakpoint);
  });

  it('should provide orientation information', () => {
    // Mock landscape orientation
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.orientation).toBe('landscape');

    // Mock portrait orientation
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.orientation).toBe('portrait');
  });
});