# Advanced Navigation System

This directory contains the advanced navigation and breadcrumbs system for the personal website. The system provides enhanced user experience through breadcrumb navigation, recently viewed content tracking, contextual navigation suggestions, and keyboard shortcuts.

## Components

### Breadcrumbs
- **File**: `Breadcrumbs.tsx`
- **Purpose**: Displays hierarchical navigation breadcrumbs
- **Features**:
  - Automatic breadcrumb generation based on URL path
  - Custom breadcrumb support
  - Home icon for root navigation
  - Responsive design
  - Accessibility support with ARIA labels

### ContextualNavigation
- **File**: `ContextualNavigation.tsx`
- **Purpose**: Shows relevant navigation suggestions based on current page
- **Features**:
  - Related content suggestions
  - Recently viewed content
  - Page type-specific suggestions
  - Configurable maximum suggestions
  - Visual indicators for recent items

### EnhancedHeader
- **File**: `EnhancedHeader.tsx`
- **Purpose**: Enhanced header with breadcrumbs and active state indicators
- **Features**:
  - Active navigation state highlighting
  - Integrated breadcrumb display
  - Mobile-responsive menu
  - Theme toggle integration

### KeyboardShortcutsHelp
- **File**: `KeyboardShortcutsHelp.tsx`
- **Purpose**: Modal displaying available keyboard shortcuts
- **Features**:
  - Categorized shortcut display
  - Floating help button
  - Keyboard navigation support
  - Custom shortcut support

### NavigationProvider
- **File**: `NavigationProvider.tsx`
- **Purpose**: Context provider for navigation state and tracking
- **Features**:
  - Automatic page visit tracking
  - Recently viewed content management
  - Global keyboard shortcuts enablement
  - Navigation context for child components

### PageWrapper
- **File**: `PageWrapper.tsx`
- **Purpose**: Wrapper component for pages with navigation features
- **Features**:
  - Automatic page tracking
  - Contextual navigation sidebar
  - Flexible layout options
  - Page metadata integration

## Hooks

### useRecentlyViewed
- **File**: `../hooks/useRecentlyViewed.ts`
- **Purpose**: Manages recently viewed content tracking
- **Features**:
  - localStorage persistence
  - Automatic deduplication
  - Maximum item limits
  - Error handling

### useKeyboardShortcuts
- **File**: `../hooks/useKeyboardShortcuts.ts`
- **Purpose**: Manages keyboard shortcuts functionality
- **Features**:
  - Default navigation shortcuts
  - Custom shortcut support
  - Input field detection
  - Event prevention and handling

## Default Keyboard Shortcuts

| Shortcut | Action | Category |
|----------|--------|----------|
| `Alt + H` | Go to Home | Navigation |
| `Alt + P` | Go to Portfolio | Navigation |
| `Alt + B` | Go to Blog | Navigation |
| `Alt + R` | Go to Reviews | Navigation |
| `Ctrl + /` | Open Search | Search |
| `Ctrl + K` | Open Search (Alternative) | Search |
| `Alt + T` | Toggle Theme | Theme |
| `Shift + ?` | Show Keyboard Shortcuts | Accessibility |

## Usage Examples

### Basic Page with Navigation
```tsx
import { PageWrapper } from '@/components/navigation/PageWrapper';

export default function MyPage() {
  const pageInfo = {
    id: 'my-page',
    title: 'My Page',
    href: '/my-page',
    type: 'page' as const,
    description: 'Description of my page',
  };

  return (
    <PageWrapper pageInfo={pageInfo}>
      <h1>My Page Content</h1>
    </PageWrapper>
  );
}
```

### Custom Breadcrumbs
```tsx
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

const customBreadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Category', href: '/category' },
  { label: 'Current Page', href: '/category/current', isCurrentPage: true }
];

<Breadcrumbs customItems={customBreadcrumbs} />
```

### Contextual Navigation
```tsx
import { ContextualNavigation } from '@/components/navigation/ContextualNavigation';

const relatedContent = [
  {
    title: 'Related Article',
    href: '/blog/related-article',
    description: 'A related blog post'
  }
];

<ContextualNavigation
  currentPageType="blog"
  currentPageTitle="Current Post"
  relatedContent={relatedContent}
/>
```

### Custom Keyboard Shortcuts
```tsx
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const customShortcuts = [
  {
    key: 'e',
    ctrlKey: true,
    description: 'Edit current page',
    action: () => console.log('Edit action'),
    category: 'navigation' as const
  }
];

useKeyboardShortcuts({ shortcuts: customShortcuts });
```

## Integration

The navigation system is automatically integrated into the main layout through:

1. **NavigationProvider** - Wraps the entire application
2. **KeyboardShortcutsHelp** - Added to the main layout
3. **Enhanced Header** - Integrated into the header component
4. **Page Tracking** - Automatic tracking of page visits

## Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling in modals
- **Semantic HTML**: Proper use of navigation landmarks
- **Screen Reader Support**: Compatible with screen readers

## Performance Considerations

- **Lazy Loading**: Components are loaded only when needed
- **localStorage**: Efficient storage of recently viewed items
- **Event Debouncing**: Keyboard events are properly handled
- **Memory Management**: Proper cleanup of event listeners

## Testing

All components and hooks include comprehensive tests:
- Unit tests for individual components
- Integration tests for user interactions
- Accessibility tests with axe-core
- Keyboard navigation tests

Run tests with:
```bash
npm test -- --testPathPatterns="navigation|useRecentlyViewed|useKeyboardShortcuts"
```

## Browser Support

- Modern browsers with ES6+ support
- localStorage support required for recently viewed items
- Keyboard event support for shortcuts
- CSS Grid and Flexbox support for layouts