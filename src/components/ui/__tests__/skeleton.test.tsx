import { render, screen } from '@testing-library/react';
import { Skeleton } from '../skeleton';

describe('Skeleton Component', () => {
  it('should render with default props', () => {
    render(<Skeleton />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse', 'bg-gray-200', 'rounded');
  });

  it('should apply custom className', () => {
    render(<Skeleton className="custom-class" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should render with custom width and height', () => {
    render(<Skeleton className="w-32 h-8" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('w-32', 'h-8');
  });

  it('should render multiple skeleton lines', () => {
    render(
      <div>
        <Skeleton className="h-4 mb-2" />
        <Skeleton className="h-4 mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
    
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('should support dark mode styling', () => {
    render(<Skeleton className="dark:bg-gray-700" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('dark:bg-gray-700');
  });

  it('should render as different HTML elements', () => {
    const { rerender } = render(<Skeleton as="span" />);
    expect(screen.getByTestId('skeleton').tagName).toBe('SPAN');

    rerender(<Skeleton as="article" />);
    expect(screen.getByTestId('skeleton').tagName).toBe('ARTICLE');
  });

  it('should handle accessibility attributes', () => {
    render(<Skeleton aria-label="Loading content" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
  });
});