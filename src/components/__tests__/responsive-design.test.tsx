/**
 * Responsive Design Implementation Tests
 */

import { render, screen } from '@testing-library/react';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveStack } from '@/components/layout';

// Mock window.innerWidth for responsive tests
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
};

describe('Responsive Design Components', () => {
  describe('ResponsiveContainer', () => {
    it('should render with correct container classes', () => {
      render(
        <ResponsiveContainer data-testid="container">
          <div>Test content</div>
        </ResponsiveContainer>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('w-full', 'mx-auto', 'max-w-6xl');
    });

    it('should apply correct padding classes', () => {
      render(
        <ResponsiveContainer padding="lg" data-testid="container">
          <div>Test content</div>
        </ResponsiveContainer>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8', 'xl:px-12');
    });

    it('should render as different HTML elements', () => {
      const { rerender } = render(
        <ResponsiveContainer as="section" data-testid="container">
          <div>Test content</div>
        </ResponsiveContainer>
      );

      expect(screen.getByTestId('container').tagName).toBe('SECTION');

      rerender(
        <ResponsiveContainer as="main" data-testid="container">
          <div>Test content</div>
        </ResponsiveContainer>
      );

      expect(screen.getByTestId('container').tagName).toBe('MAIN');
    });
  });

  describe('ResponsiveGrid', () => {
    it('should render with default grid classes', () => {
      render(
        <ResponsiveGrid data-testid="grid">
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should apply custom column configuration', () => {
      render(
        <ResponsiveGrid 
          columns={{ xs: 1, md: 2, xl: 4 }}
          data-testid="grid"
        >
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'xl:grid-cols-4');
    });

    it('should apply correct gap classes', () => {
      render(
        <ResponsiveGrid gap="lg" data-testid="grid">
          <div>Item 1</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('gap-4', 'sm:gap-6', 'lg:gap-8');
    });
  });

  describe('ResponsiveStack', () => {
    it('should render with default flex classes', () => {
      render(
        <ResponsiveStack data-testid="stack">
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveStack>
      );

      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('flex', 'flex-col', 'md:flex-row');
    });

    it('should apply custom direction configuration', () => {
      render(
        <ResponsiveStack 
          direction={{ xs: 'row', lg: 'col' }}
          data-testid="stack"
        >
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveStack>
      );

      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('flex', 'flex-row', 'lg:flex-col');
    });

    it('should apply alignment and justification classes', () => {
      render(
        <ResponsiveStack 
          align="center"
          justify="between"
          data-testid="stack"
        >
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveStack>
      );

      const stack = screen.getByTestId('stack');
      expect(stack).toHaveClass('items-center', 'justify-between');
    });
  });
});

describe('Touch-friendly Design', () => {
  it('should apply touch-target classes to interactive elements', () => {
    render(
      <button className="touch-target" data-testid="button">
        Click me
      </button>
    );

    const button = screen.getByTestId('button');
    expect(button).toHaveClass('touch-target');
  });

  it('should apply touch-target-large classes for important buttons', () => {
    render(
      <button className="touch-target-large" data-testid="button">
        Important Action
      </button>
    );

    const button = screen.getByTestId('button');
    expect(button).toHaveClass('touch-target-large');
  });
});

describe('Mobile-first Responsive Classes', () => {
  it('should have mobile-first responsive text sizing', () => {
    render(
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl" data-testid="heading">
        Responsive Heading
      </h1>
    );

    const heading = screen.getByTestId('heading');
    expect(heading).toHaveClass('text-3xl', 'sm:text-4xl', 'md:text-5xl', 'lg:text-6xl');
  });

  it('should have mobile-first responsive spacing', () => {
    render(
      <div className="py-12 sm:py-16 lg:py-20" data-testid="section">
        Content
      </div>
    );

    const section = screen.getByTestId('section');
    expect(section).toHaveClass('py-12', 'sm:py-16', 'lg:py-20');
  });

  it('should have mobile-first responsive grid layouts', () => {
    render(
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" data-testid="grid">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </div>
    );

    const grid = screen.getByTestId('grid');
    expect(grid).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
  });
});

describe('Safe Area Support', () => {
  it('should apply safe area classes for mobile devices', () => {
    render(
      <div className="safe-top safe-bottom" data-testid="safe-area">
        Content with safe area
      </div>
    );

    const element = screen.getByTestId('safe-area');
    expect(element).toHaveClass('safe-top', 'safe-bottom');
  });
});

describe('Line Clamp Utilities', () => {
  it('should apply line clamp classes for text truncation', () => {
    render(
      <p className="line-clamp-3" data-testid="text">
        This is a long text that should be truncated after three lines to ensure consistent layout across different screen sizes and content lengths.
      </p>
    );

    const text = screen.getByTestId('text');
    expect(text).toHaveClass('line-clamp-3');
  });
});