import { render, screen } from '@testing-library/react';
import { CommentSection } from '../CommentSection';

// Mock the Giscus component
jest.mock('@giscus/react', () => {
  return function MockGiscus(props: Record<string, unknown>) {
    return (
      <div data-testid='giscus-component' data-props={JSON.stringify(props)} />
    );
  };
});

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    resolvedTheme: 'light',
  }),
}));

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_GISCUS_REPO: 'test-user/test-repo',
  NEXT_PUBLIC_GISCUS_REPO_ID: 'test-repo-id',
  NEXT_PUBLIC_GISCUS_CATEGORY: 'General',
  NEXT_PUBLIC_GISCUS_CATEGORY_ID: 'test-category-id',
};

describe('CommentSection', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
    // Mock environment variables
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should render comment section with Giscus when config is valid', () => {
    render(<CommentSection postSlug='test-post' />);

    expect(screen.getByText('댓글')).toBeInTheDocument();
    expect(screen.getByTestId('giscus-component')).toBeInTheDocument();
    expect(screen.getByText(/GitHub 계정으로 로그인하여/)).toBeInTheDocument();
  });

  it('should show configuration warning when Giscus config is missing', () => {
    // Remove required config
    delete process.env.NEXT_PUBLIC_GISCUS_REPO;

    render(<CommentSection postSlug='test-post' />);

    expect(screen.getByText('댓글 시스템 설정 필요')).toBeInTheDocument();
    expect(
      screen.getByText(/댓글 기능을 사용하려면 Giscus 설정이 필요합니다/)
    ).toBeInTheDocument();
    expect(screen.queryByTestId('giscus-component')).not.toBeInTheDocument();
  });

  it('should pass correct props to Giscus component', () => {
    render(<CommentSection postSlug='my-blog-post' />);

    const giscusComponent = screen.getByTestId('giscus-component');
    const props = JSON.parse(
      giscusComponent.getAttribute('data-props') || '{}'
    );

    expect(props.repo).toBe('test-user/test-repo');
    expect(props.repoId).toBe('test-repo-id');
    expect(props.category).toBe('General');
    expect(props.categoryId).toBe('test-category-id');
    expect(props.term).toBe('my-blog-post');
    expect(props.mapping).toBe('pathname');
    expect(props.reactionsEnabled).toBe('1');
    expect(props.lang).toBe('ko');
  });

  it('should render anonymous comment guide', () => {
    render(<CommentSection postSlug='test-post' />);

    expect(screen.getByText('익명 댓글 작성 방법')).toBeInTheDocument();
  });

  it('should accept custom Giscus config', () => {
    const customConfig = {
      lang: 'en',
      reactionsEnabled: false,
      inputPosition: 'top' as const,
    };

    render(<CommentSection postSlug='test-post' giscusConfig={customConfig} />);

    const giscusComponent = screen.getByTestId('giscus-component');
    const props = JSON.parse(
      giscusComponent.getAttribute('data-props') || '{}'
    );

    expect(props.lang).toBe('en');
    expect(props.reactionsEnabled).toBe('0');
    expect(props.inputPosition).toBe('top');
  });

  it('should show moderation notice', () => {
    render(<CommentSection postSlug='test-post' />);

    expect(
      screen.getByText(/댓글은 GitHub Discussions를 통해 관리됩니다/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/부적절한 댓글은 관리자에 의해 삭제될 수 있습니다/)
    ).toBeInTheDocument();
  });
});
