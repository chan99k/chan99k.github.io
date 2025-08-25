import { renderHook } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);
  });

  it('should initialize with default shortcuts', () => {
    const { result } = renderHook(() => useKeyboardShortcuts());
    
    expect(result.current.shortcuts).toHaveLength(8);
    expect(result.current.enabled).toBe(true);
  });

  it('should handle Alt+H shortcut for home navigation', () => {
    renderHook(() => useKeyboardShortcuts());

    const event = new KeyboardEvent('keydown', {
      key: 'h',
      altKey: true,
    });

    document.dispatchEvent(event);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should handle Alt+P shortcut for portfolio navigation', () => {
    renderHook(() => useKeyboardShortcuts());

    const event = new KeyboardEvent('keydown', {
      key: 'p',
      altKey: true,
    });

    document.dispatchEvent(event);
    expect(mockPush).toHaveBeenCalledWith('/portfolio');
  });

  it('should handle Ctrl+/ shortcut for search', () => {
    renderHook(() => useKeyboardShortcuts());

    const event = new KeyboardEvent('keydown', {
      key: '/',
      ctrlKey: true,
    });

    document.dispatchEvent(event);
    expect(mockPush).toHaveBeenCalledWith('/search');
  });

  it('should not trigger shortcuts when disabled', () => {
    renderHook(() => useKeyboardShortcuts({ enabled: false }));

    const event = new KeyboardEvent('keydown', {
      key: 'h',
      altKey: true,
    });

    document.dispatchEvent(event);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should not trigger shortcuts when typing in input fields', () => {
    renderHook(() => useKeyboardShortcuts());

    // Create a mock input element
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', {
      key: 'h',
      altKey: true,
    });

    Object.defineProperty(event, 'target', {
      value: input,
      enumerable: true,
    });

    document.dispatchEvent(event);
    expect(mockPush).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should handle custom shortcuts', () => {
    const customAction = jest.fn();
    const customShortcuts = [
      {
        key: 'x',
        ctrlKey: true,
        description: 'Custom action',
        action: customAction,
        category: 'navigation' as const,
      },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts: customShortcuts }));

    const event = new KeyboardEvent('keydown', {
      key: 'x',
      ctrlKey: true,
    });

    document.dispatchEvent(event);
    expect(customAction).toHaveBeenCalled();
  });

  it('should dispatch custom events for theme toggle', () => {
    const dispatchSpy = jest.spyOn(document, 'dispatchEvent');
    renderHook(() => useKeyboardShortcuts());

    const event = new KeyboardEvent('keydown', {
      key: 't',
      altKey: true,
    });

    document.dispatchEvent(event);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'toggle-theme',
      })
    );
  });

  it('should dispatch custom events for shortcuts help', () => {
    const dispatchSpy = jest.spyOn(document, 'dispatchEvent');
    renderHook(() => useKeyboardShortcuts());

    const event = new KeyboardEvent('keydown', {
      key: '?',
      shiftKey: true,
    });

    document.dispatchEvent(event);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'show-shortcuts-help',
      })
    );
  });
});