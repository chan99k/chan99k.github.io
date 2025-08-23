import { render, screen } from '@testing-library/react';
import { LoadingSpinner, LoadingSkeleton, LoadingCard } from '../loading';

describe('Loading Components', () => {
  describe('LoadingSpinner', () => {
    it('should render spinner with default size', () => {
      render(<LoadingSpinner data-testid="spinner" />);

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should render spinner with custom size', () => {
      render(<LoadingSpinner size="large" data-testid="spinner" />);

      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('large');
    });

    it('should have proper accessibility attributes', () => {
      render(<LoadingSpinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('should render with custom label', () => {
      render(<LoadingSpinner label="Loading content..." />);

      const spinner = screen.getByLabelText('Loading content...');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('LoadingSkeleton', () => {
    it('should render skeleton with default props', () => {
      render(<LoadingSkeleton data-testid="skeleton" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('should render skeleton with custom width and height', () => {
      render(
        <LoadingSkeleton 
          width="200px" 
          height="100px" 
          data-testid="skeleton" 
        />
      );

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({
        width: '200px',
        height: '100px',
      });
    });

    it('should render circular skeleton', () => {
      render(<LoadingSkeleton circular data-testid="skeleton" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('rounded-full');
    });

    it('should render multiple skeleton lines', () => {
      render(<LoadingSkeleton lines={3} data-testid="skeleton" />);

      const skeletons = screen.getAllByTestId('skeleton');
      expect(skeletons).toHaveLength(3);
    });
  });

  describe('LoadingCard', () => {
    it('should render loading card with skeleton elements', () => {
      render(<LoadingCard data-testid="loading-card" />);

      const card = screen.getByTestId('loading-card');
      expect(card).toBeInTheDocument();
      
      // Should contain skeleton elements
      const skeletons = card.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render with custom variant', () => {
      render(<LoadingCard variant="blog" data-testid="loading-card" />);

      const card = screen.getByTestId('loading-card');
      expect(card).toHaveClass('blog-loading');
    });

    it('should have proper accessibility attributes', () => {
      render(<LoadingCard />);

      const card = screen.getByRole('status');
      expect(card).toHaveAttribute('aria-label', 'Loading content');
    });
  });

  describe('Loading States', () => {
    it('should handle loading state transitions', () => {
      const { rerender } = render(<LoadingSpinner data-testid="spinner" />);

      expect(screen.getByTestId('spinner')).toBeInTheDocument();

      // Simulate loading complete
      rerender(<div data-testid="content">Loaded content</div>);

      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('should maintain accessibility during loading states', () => {
      render(
        <div>
          <LoadingSpinner />
          <div aria-live="polite" aria-atomic="true">
            Loading content...
          </div>
        </div>
      );

      const liveRegion = screen.getByText('Loading content...');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });
});