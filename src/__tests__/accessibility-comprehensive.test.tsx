import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BlogPostList } from '@/components/blog/BlogPostList';
import { RestaurantReviewsList } from '@/components/reviews/RestaurantReviewsList';
import { ProjectsSection } from '@/components/portfolio/ProjectsSection';
import { ImageGallery } from '@/components/reviews/ImageGallery';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { BlogPost, RestaurantReview, Project } from '@/types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img alt="" {...props} />,
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
    ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Test data
const mockBlogPosts: BlogPost[] = [
  {
    slug: 'test-post-1',
    title: 'First Test Blog Post',
    description: 'This is the first test blog post',
    date: '2024-01-15',
    tags: ['react', 'typescript'],
    category: 'tech',
    readingTime: 5,
    excerpt: 'First test excerpt',
    draft: false,
    featured: true,
    author: 'Test Author',
  },
  {
    slug: 'test-post-2',
    title: 'Second Test Blog Post',
    description: 'This is the second test blog post',
    date: '2024-01-10',
    tags: ['javascript', 'web'],
    category: 'tutorial',
    readingTime: 3,
    excerpt: 'Second test excerpt',
    draft: false,
    featured: false,
    author: 'Test Author',
  },
];

const mockRestaurants: RestaurantReview[] = [
  {
    id: 'restaurant-1',
    name: '테스트 맛집',
    location: {
      address: '서울시 강남구 테스트로 123',
      coordinates: { lat: 37.5665, lng: 126.978 },
      region: '강남구',
    },
    rating: 5,
    visitDate: '2024-01-15',
    cuisine: 'korean',
    priceRange: 3,
    images: ['/images/test1.jpg', '/images/test2.jpg'],
    review: '맛있는 음식점입니다.',
    tags: ['한식', '맛집'],
    mapLinks: {
      naver: 'https://naver.me/test',
      kakao: 'https://kakao.com/test',
      google: 'https://google.com/test',
    },
  },
];

const mockProjects: Project[] = [
  {
    id: 'project-1',
    title: 'Test Project',
    description: 'A test project for accessibility testing',
    period: '2024',
    teamSize: 1,
    techStack: ['React', 'TypeScript', 'Next.js'],
    githubUrl: 'https://github.com/test/project',
    demoUrl: 'https://demo.example.com',
    problems: [
      {
        id: 'problem-1',
        title: 'Test Problem',
        problem: 'This is a test problem',
        solution: 'This is the solution',
        technologies: ['React', 'TypeScript'],
        projectId: 'project-1',
        slug: 'test-problem',
        isDetailedInBlog: false,
      },
    ],
  },
];

const mockTocItems = [
  { id: 'heading-1', title: 'Introduction', level: 1 },
  { id: 'heading-2', title: 'Getting Started', level: 2 },
  { id: 'heading-3', title: 'Installation', level: 3 },
  { id: 'heading-4', title: 'Configuration', level: 2 },
];

describe('Comprehensive Accessibility Tests', () => {
  describe('Blog Components Accessibility', () => {
    it('should not have accessibility violations in BlogPostList', async () => {
      const { container } = render(<BlogPostList posts={mockBlogPosts} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels in blog list', () => {
      const { container } = render(<BlogPostList posts={mockBlogPosts} />);
      
      // Check for proper list structure
      const list = container.querySelector('ul, ol');
      expect(list).toHaveAttribute('role', 'list');
      
      // Check for proper article structure
      const articles = container.querySelectorAll('article');
      articles.forEach(article => {
        expect(article).toHaveAttribute('role', 'article');
      });
    });

    it('should have proper heading hierarchy in blog posts', () => {
      const { container } = render(<BlogPostList posts={mockBlogPosts} />);
      
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
      
      // Check that heading levels don't skip
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1];
        expect(diff).toBeLessThanOrEqual(1);
      }
    });

    it('should have accessible table of contents', async () => {
      const { container } = render(<TableOfContents items={mockTocItems} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper navigation structure in TOC', () => {
      const { container } = render(<TableOfContents items={mockTocItems} />);
      
      const nav = container.querySelector('nav');
      expect(nav).toHaveAttribute('aria-label', 'Table of contents');
      
      const links = container.querySelectorAll('a');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
        expect(link.textContent?.trim()).toBeTruthy();
      });
    });
  });

  describe('Restaurant Review Components Accessibility', () => {
    it('should not have accessibility violations in RestaurantReviewsList', async () => {
      const { container } = render(<RestaurantReviewsList reviews={mockRestaurants} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible rating display', () => {
      const { container } = render(<RestaurantReviewsList reviews={mockRestaurants} />);
      
      const ratings = container.querySelectorAll('[role="img"][aria-label*="star"]');
      ratings.forEach(rating => {
        expect(rating).toHaveAttribute('aria-label');
      });
    });

    it('should have accessible map links', () => {
      const { container } = render(<RestaurantReviewsList reviews={mockRestaurants} />);
      
      const mapLinks = container.querySelectorAll('a[href*="naver"], a[href*="kakao"], a[href*="google"]');
      mapLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveAttribute('aria-label');
      });
    });

    it('should not have accessibility violations in ImageGallery', async () => {
      const images = ['/test1.jpg', '/test2.jpg', '/test3.jpg'];
      const { container } = render(<ImageGallery images={images} alt="Test images" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible image gallery controls', () => {
      const images = ['/test1.jpg', '/test2.jpg', '/test3.jpg'];
      const { container } = render(<ImageGallery images={images} alt="Test images" />);
      
      const images_elements = container.querySelectorAll('img');
      images_elements.forEach((img, index) => {
        expect(img).toHaveAttribute('alt', `Test images ${index + 1}`);
      });
      
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Portfolio Components Accessibility', () => {
    it('should not have accessibility violations in ProjectsSection', async () => {
      const { container } = render(<ProjectsSection projects={mockProjects} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible project cards', () => {
      const { container } = render(<ProjectsSection projects={mockProjects} />);
      
      const projectCards = container.querySelectorAll('[role="article"], article');
      projectCards.forEach(card => {
        const heading = card.querySelector('h1, h2, h3, h4, h5, h6');
        expect(heading).toBeTruthy();
        expect(heading?.textContent?.trim()).toBeTruthy();
      });
    });

    it('should have accessible technology tags', () => {
      const { container } = render(<ProjectsSection projects={mockProjects} />);
      
      const techTags = container.querySelectorAll('[data-testid="tech-tag"], .tech-tag');
      techTags.forEach(tag => {
        expect(tag.textContent?.trim()).toBeTruthy();
      });
    });

    it('should have accessible external links', () => {
      const { container } = render(<ProjectsSection projects={mockProjects} />);
      
      const externalLinks = container.querySelectorAll('a[target="_blank"]');
      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Form Accessibility', () => {
    it('should have accessible search forms', () => {
      const { container } = render(
        <form role="search">
          <label htmlFor="search-input">Search posts</label>
          <input
            id="search-input"
            type="search"
            placeholder="Enter search terms"
            aria-describedby="search-help"
          />
          <div id="search-help">Search through blog posts and reviews</div>
          <button type="submit">Search</button>
        </form>
      );
      
      const searchInput = container.querySelector('input[type="search"]');
      expect(searchInput).toHaveAttribute('id');
      expect(searchInput).toHaveAttribute('aria-describedby');
      
      const label = container.querySelector('label');
      expect(label).toHaveAttribute('for', 'search-input');
    });

    it('should have accessible filter controls', () => {
      const { container } = render(
        <fieldset>
          <legend>Filter by category</legend>
          <input type="radio" id="tech" name="category" value="tech" />
          <label htmlFor="tech">Technology</label>
          <input type="radio" id="tutorial" name="category" value="tutorial" />
          <label htmlFor="tutorial">Tutorial</label>
        </fieldset>
      );
      
      const fieldset = container.querySelector('fieldset');
      expect(fieldset).toBeTruthy();
      
      const legend = container.querySelector('legend');
      expect(legend).toBeTruthy();
      
      const radioButtons = container.querySelectorAll('input[type="radio"]');
      radioButtons.forEach(radio => {
        expect(radio).toHaveAttribute('id');
        expect(radio).toHaveAttribute('name');
      });
      
      const labels = container.querySelectorAll('label');
      labels.forEach(label => {
        expect(label).toHaveAttribute('for');
      });
    });
  });

  describe('Interactive Elements Accessibility', () => {
    it('should have accessible buttons', () => {
      const { container } = render(
        <div>
          <button aria-label="Close dialog">×</button>
          <button>
            <span aria-hidden="true">👍</span>
            <span className="sr-only">Like this post</span>
          </button>
          <button disabled aria-label="Loading...">
            Loading
          </button>
        </div>
      );
      
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        const hasAriaLabel = button.hasAttribute('aria-label');
        const hasTextContent = button.textContent?.trim() !== '';
        const hasScreenReaderText = button.querySelector('.sr-only');
        
        expect(hasAriaLabel || hasTextContent || hasScreenReaderText).toBe(true);
      });
    });

    it('should have accessible modal dialogs', async () => {
      const { container } = render(
        <div
          role="dialog"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
          aria-modal="true"
        >
          <h2 id="dialog-title">Confirm Action</h2>
          <p id="dialog-description">Are you sure you want to proceed?</p>
          <button>Cancel</button>
          <button>Confirm</button>
        </div>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have accessible dropdown menus', () => {
      const { container } = render(
        <div>
          <button
            aria-haspopup="true"
            aria-expanded="false"
            aria-controls="dropdown-menu"
          >
            Menu
          </button>
          <ul id="dropdown-menu" role="menu" hidden>
            <li role="menuitem">
              <a href="/option1">Option 1</a>
            </li>
            <li role="menuitem">
              <a href="/option2">Option 2</a>
            </li>
          </ul>
        </div>
      );
      
      const menuButton = container.querySelector('button');
      expect(menuButton).toHaveAttribute('aria-haspopup', 'true');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      expect(menuButton).toHaveAttribute('aria-controls');
      
      const menu = container.querySelector('[role="menu"]');
      expect(menu).toHaveAttribute('id');
      
      const menuItems = container.querySelectorAll('[role="menuitem"]');
      expect(menuItems.length).toBeGreaterThan(0);
    });
  });

  describe('Color and Contrast Accessibility', () => {
    it('should have sufficient color contrast', async () => {
      const { container } = render(
        <div>
          <p style={{ color: '#000000', backgroundColor: '#ffffff' }}>
            High contrast text
          </p>
          <button style={{ color: '#ffffff', backgroundColor: '#0066cc' }}>
            Accessible button
          </button>
        </div>
      );
      
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
      
      expect(results).toHaveNoViolations();
    });

    it('should not rely solely on color for information', () => {
      const { container } = render(
        <div>
          <span className="error" aria-label="Error: Required field">
            <span aria-hidden="true">⚠️</span>
            This field is required
          </span>
          <span className="success" aria-label="Success: Form submitted">
            <span aria-hidden="true">✅</span>
            Form submitted successfully
          </span>
        </div>
      );
      
      const statusMessages = container.querySelectorAll('[aria-label*="Error"], [aria-label*="Success"]');
      statusMessages.forEach(message => {
        expect(message).toHaveAttribute('aria-label');
        // Should have text content or icon in addition to color
        expect(message.textContent?.trim()).toBeTruthy();
      });
    });
  });

  describe('Keyboard Navigation Accessibility', () => {
    it('should have proper focus management', () => {
      const { container } = render(
        <div>
          <a href="/link1">Link 1</a>
          <button>Button 1</button>
          <input type="text" />
          <button tabIndex={-1}>Skip this button</button>
          <a href="/link2">Link 2</a>
        </div>
      );
      
      const focusableElements = container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      expect(focusableElements.length).toBe(4); // Should skip the tabIndex={-1} button
    });

    it('should have skip links for keyboard users', () => {
      const { container } = render(
        <div>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <nav>Navigation</nav>
          <main id="main-content">Main content</main>
        </div>
      );
      
      const skipLink = container.querySelector('.skip-link');
      expect(skipLink).toHaveAttribute('href', '#main-content');
      
      const mainContent = container.querySelector('#main-content');
      expect(mainContent).toBeTruthy();
    });
  });

  describe('Screen Reader Accessibility', () => {
    it('should have proper landmark regions', () => {
      const { container } = render(
        <div>
          <header role="banner">Site header</header>
          <nav role="navigation" aria-label="Main navigation">Navigation</nav>
          <main role="main">Main content</main>
          <aside role="complementary">Sidebar</aside>
          <footer role="contentinfo">Site footer</footer>
        </div>
      );
      
      expect(container.querySelector('[role="banner"]')).toBeTruthy();
      expect(container.querySelector('[role="navigation"]')).toBeTruthy();
      expect(container.querySelector('[role="main"]')).toBeTruthy();
      expect(container.querySelector('[role="complementary"]')).toBeTruthy();
      expect(container.querySelector('[role="contentinfo"]')).toBeTruthy();
    });

    it('should have proper live regions for dynamic content', () => {
      const { container } = render(
        <div>
          <div aria-live="polite" aria-label="Status messages">
            Form saved successfully
          </div>
          <div aria-live="assertive" aria-label="Error messages">
            Error: Please fix the following issues
          </div>
        </div>
      );
      
      const politeRegion = container.querySelector('[aria-live="polite"]');
      expect(politeRegion).toBeTruthy();
      
      const assertiveRegion = container.querySelector('[aria-live="assertive"]');
      expect(assertiveRegion).toBeTruthy();
    });

    it('should have proper alternative text for images', () => {
      const { container } = render(
        <div>
          <img src="/photo.jpg" alt="A beautiful sunset over the mountains" />
          <img src="/icon.svg" alt="" role="presentation" />
          <img src="/chart.png" alt="Sales increased by 25% from January to March" />
        </div>
      );
      
      const images = container.querySelectorAll('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
      
      // Decorative image should have empty alt and presentation role
      const decorativeImg = container.querySelector('img[src="/icon.svg"]');
      expect(decorativeImg).toHaveAttribute('alt', '');
      expect(decorativeImg).toHaveAttribute('role', 'presentation');
    });
  });
});