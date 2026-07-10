# Testing Guide

## Overview

1Rupee has comprehensive test coverage across API and web components:

- **API**: Unit tests with Bun's native test runner
- **Web**: Component tests with Vitest + React Testing Library

## Running Tests

### All tests
```bash
bun run test
```

### API tests only
```bash
bun run -w apps/api test
```

### Web component tests
```bash
bun run -w apps/web test
```

### Watch mode (auto-rerun on changes)
```bash
bun run -w apps/web test -- --watch
```

### Coverage reports
```bash
bun run -w apps/web test:coverage
```

### UI test explorer
```bash
bun run -w apps/web test:ui
```

## API Tests (Bun)

Located in `apps/api/src/__tests__/`

### Running
```bash
bun test
```

### Test files
- `admin.test.ts` - Admin endpoints (NGO, campaign, user, payout management)
- `api.test.ts` - Public API endpoints (campaigns, donations, etc.)
- `campaign-service.test.ts` - Campaign business logic

### Structure
```typescript
describe('Endpoint', () => {
  it('should do something', async () => {
    const res = await makeRequest('GET', '/path');
    expect(res.status).toBe(200);
    expect(res.data).toMatchObject({ /* ... */ });
  });
});
```

## Web Component Tests (Vitest)

Located in `apps/web/components/ui/__tests__/`

### Test files
- `button.test.tsx` - Button component
- `input.test.tsx` - Input component
- `badge.test.tsx` - Badge component

### Writing tests
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    render(<Component />);
    await user.click(screen.getByRole('button'));
    // assertions...
  });
});
```

### Best practices
- Test user behavior, not implementation
- Use semantic queries: `getByRole`, `getByText`
- Avoid `wrapper.find()` style queries
- Test accessibility (roles, aria labels)
- Mock API calls, not components

## CI/CD Integration

All tests run automatically on:
- Push to `main` or `develop`
- Pull requests

See `.github/workflows/ci.yml` for full pipeline.

### Required checks
- Lint (ESLint)
- Type Check (TypeScript)
- Unit Tests (API)
- Component Tests (Web)
- Build (Turbo)

All must pass before merging to `main`.

## Coverage Goals

| Package | Target | Current |
|---------|--------|---------|
| API     | 80%    | 65%     |
| Web     | 60%    | 15%     |

See TODO in [development-roadmap.md](development-roadmap.md) for progress.

## Common Issues

### Tests fail locally but pass in CI
- Ensure `bun install` ran recently
- Clear cache: `rm -rf node_modules .next dist`
- Reinstall: `bun install`

### Database connection errors in tests
- PostgreSQL test DB must be running (`docker run -d -e POSTGRES_PASSWORD=postgres postgres:16`)
- Check `DATABASE_URL` in test env

### Flaky async tests
- Use `userEvent` instead of `fireEvent`
- Await async operations completely
- Don't use `setTimeout` in tests (use `waitFor` instead)

## Next Steps

- [ ] Admin page interaction tests (drawer workflows)
- [ ] Visual regression snapshots with Percy
- [ ] E2E tests with Playwright
- [ ] Performance benchmarks
