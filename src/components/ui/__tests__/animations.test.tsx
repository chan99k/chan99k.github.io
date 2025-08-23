import { render, screen } from '@testing-library/react';
import { AnimatedCard, AnimatedButton, PageTransition } from '../animations';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('Animation Components', () => {
  describe('AnimatedCard', () => {
    it('should render children correctly', () => {
      render(
        <AnimatedCard>
          <div>Test content</div>
        </AnimatedCard>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <AnimatedCard className="custom-class" data-testid="animated-card">
          <div>Test content</div>
        </AnimatedCard>
      );

      const card = screen.getByTestId('animated-card');
      expect(card).toHaveClass('custom-class');
    });

    it('should handle click events', () => {
      const handleClick = jest.fn();
      render(
        <AnimatedCard onClick={handleClick} data-testid="animated-card">
          <div>Test content</div>
        </AnimatedCard>
      );

      const card = screen.getByTestId('animated-card');
      card.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('AnimatedButton', () => {
    it('should render button with text', () => {
      render(<AnimatedButton>Click me</AnimatedButton>);

      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should handle click events', () => {
      const handleClick = jest.fn();
      render(<AnimatedButton onClick={handleClick}>Click me</AnimatedButton>);

      const button = screen.getByRole('button');
      button.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
      render(<AnimatedButton disabled>Click me</AnimatedButton>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should apply variant classes', () => {
      render(
        <AnimatedButton variant="primary" data-testid="button">
          Click me
        </AnimatedButton>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('primary');
    });
  });

  describe('PageTransition', () => {
    it('should render children', () => {
      render(
        <PageTransition>
          <div>Page content</div>
        </PageTransition>
      );

      expect(screen.getByText('Page content')).toBeInTheDocument();
    });

    it('should apply transition classes', () => {
      render(
        <PageTransition data-testid="page-transition">
          <div>Page content</div>
        </PageTransition>
      );

      const transition = screen.getByTestId('page-transition');
      expect(transition).toHaveClass('page-transition');
    });
  });
});