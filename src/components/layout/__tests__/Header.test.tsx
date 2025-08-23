import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    resolvedTheme: 'light',
  }),
}));

describe('Header Component', () => {
  it('should render navigation links', () => {
    render(<Header currentPath="/" />);

    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
  });

  it('should highlight current page', () => {
    render(<Header currentPath="/blog" />);

    const blogLink = screen.getByText('Blog').closest('a');
    expect(blogLink).toHaveClass('text-primary');
  });

  it('should render mobile menu toggle', () => {
    render(<Header currentPath="/" />);

    const menuButton = screen.getByRole('button', { name: /menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('should toggle mobile menu', async () => {
    const user = userEvent.setup();
    render(<Header currentPath="/" />);

    const menuButton = screen.getByRole('button', { name: /menu/i });
    
    // Menu should be closed initially
    expect(screen.queryByTestId('mobile-menu')).not.toBeVisible();

    // Click to open menu
    await user.click(menuButton);
    expect(screen.getByTestId('mobile-menu')).toBeVisible();

    // Click to close menu
    await user.click(menuButton);
    expect(screen.queryByTestId('mobile-menu')).not.toBeVisible();
  });

  it('should render theme toggle button', () => {
    render(<Header currentPath="/" />);

    const themeButton = screen.getByRole('button', { name: /theme/i });
    expect(themeButton).toBeInTheDocument();
  });

  it('should close mobile menu when clicking outside', async () => {
    const user = userEvent.setup();
    render(<Header currentPath="/" />);

    const menuButton = screen.getByRole('button', { name: /menu/i });
    
    // Open menu
    await user.click(menuButton);
    expect(screen.getByTestId('mobile-menu')).toBeVisible();

    // Click outside
    await user.click(document.body);
    expect(screen.queryByTestId('mobile-menu')).not.toBeVisible();
  });

  it('should close mobile menu when pressing Escape', async () => {
    const user = userEvent.setup();
    render(<Header currentPath="/" />);

    const menuButton = screen.getByRole('button', { name: /menu/i });
    
    // Open menu
    await user.click(menuButton);
    expect(screen.getByTestId('mobile-menu')).toBeVisible();

    // Press Escape
    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('mobile-menu')).not.toBeVisible();
  });

  it('should have proper ARIA attributes', () => {
    render(<Header currentPath="/" />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');

    const menuButton = screen.getByRole('button', { name: /menu/i });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('should update ARIA attributes when menu is open', async () => {
    const user = userEvent.setup();
    render(<Header currentPath="/" />);

    const menuButton = screen.getByRole('button', { name: /menu/i });
    
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  });
});