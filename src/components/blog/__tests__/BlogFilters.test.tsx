import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlogFilters } from '../BlogFilters';

const mockCategories = ['tech', 'tutorial', 'review'];
const mockTags = ['react', 'typescript', 'nextjs', 'javascript'];

const defaultProps = {
  categories: mockCategories,
  tags: mockTags,
  selectedCategory: '',
  selectedTags: [],
  searchTerm: '',
  onCategoryChange: jest.fn(),
  onTagsChange: jest.fn(),
  onSearchChange: jest.fn(),
  onClearFilters: jest.fn(),
};

describe('BlogFilters Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input', () => {
    render(<BlogFilters {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/검색/);
    expect(searchInput).toBeInTheDocument();
  });

  it('should render category filter', () => {
    render(<BlogFilters {...defaultProps} />);

    expect(screen.getByText('카테고리')).toBeInTheDocument();
    expect(screen.getByText('전체')).toBeInTheDocument();
    expect(screen.getByText('tech')).toBeInTheDocument();
    expect(screen.getByText('tutorial')).toBeInTheDocument();
    expect(screen.getByText('review')).toBeInTheDocument();
  });

  it('should render tag filter', () => {
    render(<BlogFilters {...defaultProps} />);

    expect(screen.getByText('태그')).toBeInTheDocument();
    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText('#typescript')).toBeInTheDocument();
    expect(screen.getByText('#nextjs')).toBeInTheDocument();
    expect(screen.getByText('#javascript')).toBeInTheDocument();
  });

  it('should call onSearchChange when typing in search input', async () => {
    const user = userEvent.setup();
    render(<BlogFilters {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/검색/);
    await user.type(searchInput, 'react');

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('react');
  });

  it('should call onCategoryChange when selecting category', async () => {
    const user = userEvent.setup();
    render(<BlogFilters {...defaultProps} />);

    const techCategory = screen.getByText('tech');
    await user.click(techCategory);

    expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('tech');
  });

  it('should call onTagsChange when selecting tags', async () => {
    const user = userEvent.setup();
    render(<BlogFilters {...defaultProps} />);

    const reactTag = screen.getByText('#react');
    await user.click(reactTag);

    expect(defaultProps.onTagsChange).toHaveBeenCalledWith(['react']);
  });

  it('should show selected category as active', () => {
    render(<BlogFilters {...defaultProps} selectedCategory="tech" />);

    const techCategory = screen.getByText('tech');
    expect(techCategory).toHaveClass('bg-primary');
  });

  it('should show selected tags as active', () => {
    render(<BlogFilters {...defaultProps} selectedTags={['react', 'typescript']} />);

    const reactTag = screen.getByText('#react');
    const typescriptTag = screen.getByText('#typescript');
    
    expect(reactTag).toHaveClass('bg-primary');
    expect(typescriptTag).toHaveClass('bg-primary');
  });

  it('should show clear filters button when filters are active', () => {
    render(<BlogFilters {...defaultProps} selectedCategory="tech" selectedTags={['react']} />);

    const clearButton = screen.getByText('필터 초기화');
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear filters button when no filters are active', () => {
    render(<BlogFilters {...defaultProps} />);

    const clearButton = screen.queryByText('필터 초기화');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should call onClearFilters when clicking clear button', async () => {
    const user = userEvent.setup();
    render(<BlogFilters {...defaultProps} selectedCategory="tech" />);

    const clearButton = screen.getByText('필터 초기화');
    await user.click(clearButton);

    expect(defaultProps.onClearFilters).toHaveBeenCalled();
  });

  it('should handle multiple tag selection', async () => {
    const user = userEvent.setup();
    const onTagsChange = jest.fn();
    render(<BlogFilters {...defaultProps} onTagsChange={onTagsChange} selectedTags={['react']} />);

    const typescriptTag = screen.getByText('#typescript');
    await user.click(typescriptTag);

    expect(onTagsChange).toHaveBeenCalledWith(['react', 'typescript']);
  });

  it('should handle tag deselection', async () => {
    const user = userEvent.setup();
    const onTagsChange = jest.fn();
    render(<BlogFilters {...defaultProps} onTagsChange={onTagsChange} selectedTags={['react', 'typescript']} />);

    const reactTag = screen.getByText('#react');
    await user.click(reactTag);

    expect(onTagsChange).toHaveBeenCalledWith(['typescript']);
  });

  it('should show filter count when filters are active', () => {
    render(<BlogFilters {...defaultProps} selectedCategory="tech" selectedTags={['react', 'typescript']} />);

    expect(screen.getByText('3개 필터 적용됨')).toBeInTheDocument();
  });

  it('should be accessible with keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<BlogFilters {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/검색/);
    searchInput.focus();

    // Tab to category buttons
    await user.tab();
    expect(screen.getByText('전체')).toHaveFocus();

    // Tab to tag buttons
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    expect(screen.getByText('#react')).toHaveFocus();
  });
});