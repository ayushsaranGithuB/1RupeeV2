# Testing Guide

## Overview

1Rupee has one unified test suite, run with **Vitest**:

- **API route tests**: `server/__tests__/`
- **UI component tests**: `components/**/__tests__/`

## Running Tests

### All tests
```bash
bun run test
```

### Watch mode (auto-rerun on changes)
```bash
bun run test -- --watch
```

### Coverage reports
```bash
bun run test:coverage
```

### UI test explorer
```bash
bun run test:ui
```

## API Route Tests

Located in `server/__tests__/`.

### Test files
- `admin.test.ts` - Admin endpoints (NGO, campaign, user, payout management)
- `api.test.ts` - Public API endpoints (campaigns, donations, etc.)
- `campaign-service.test.ts` - Campaign business logic

Most route tests go through `server/__tests__/test-helpers.ts`'s `callApi(request)`,
a small dispatcher that mirrors Next.js's own `app/api/**/route.ts` file-based
routing and invokes the real handler (including its auth guard). This lets a
test exercise a full request/response cycle without spinning up a dev server.

### Structure
```typescript
import { callApi } from './test-helpers';

describe('Endpoint', () => {
  it('should do something', async () => {
    const res = await callApi(new Request('http://localhost:3000/api/path'));
    expect(res.status).toBe(200);
  });
});
```

## Web Component Tests (Vitest)

Located in `components/ui/__tests__/`.

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
- Unit Tests
- Build

All must pass before merging to `main`.

## Coverage Goals

| Area | Target | Current |
|------|--------|---------|
| API routes | 80%   | 65%     |
| Web        | 60%   | 15%     |

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
