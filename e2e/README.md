# E2E Tests for Interview Feature

This directory contains end-to-end tests for the AI interview feature using Playwright.

## Test Coverage

### 1. Authentication Tests
- Verify unauthenticated users see login buttons
- Check login requirement on history page
- Ensure protected routes redirect properly

### 2. Interview Flow Tests
- Complete interview setup (interviewer selection)
- Start interview and view initial question
- Submit answers and receive AI responses
- Navigate to result page after completion

### 3. History Page Tests
- Display list of interview sessions
- Navigate from history to result pages
- Filter sessions by status (all/completed/active)
- Sort sessions by date or score

### 4. Result Page Tests
- Display score and feedback
- Show conversation history
- Navigate to history list
- Start new interview from results

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (recommended for development)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug specific test
npm run test:e2e:debug
```

## Architecture

### Page Object Model
Tests use Page Object Model pattern for maintainability:
- `pages/interview.page.ts`: Page objects for Interview, History, and Result pages
- Encapsulates page interactions and selectors
- Makes tests easier to update when UI changes

### Mocking Strategy
Tests mock external dependencies:
- **Authentication**: Mock Supabase auth state via localStorage
- **API Calls**: Mock Netlify functions (session, RAG, AI responses)
- **Streaming**: Simulate AI streaming responses with Server-Sent Events

### Test Structure
- **Isolated**: Each test runs independently with fresh state
- **Fast**: Mocks eliminate network calls and AI latency
- **Reliable**: No flaky external dependencies

## Notes

- Tests run against local dev server (`http://localhost:4321`)
- All external services are mocked for speed and reliability
- Real integration tests should use test accounts and staging environment
- Browser binaries are downloaded on first run (`npx playwright install`)

## Future Improvements

- [ ] Add visual regression testing
- [ ] Test responsive design (mobile/tablet)
- [ ] Add accessibility tests (ARIA, keyboard navigation)
- [ ] Test real Supabase auth flow with test accounts
- [ ] Add performance metrics (Core Web Vitals)
