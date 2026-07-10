# Contributing to 1Rupee

## Development Workflow

1. **Create a feature branch** from `main` or `develop`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and test locally:
   ```bash
   bun run dev         # Start dev servers
   bun run lint        # Check code quality
   bun run type-check  # TypeScript validation
   bun run test        # Run tests
   ```

3. **Push and create a PR** - the CI pipeline will automatically:
   - Run linting checks
   - Verify TypeScript types
   - Execute unit tests
   - Build the project
   - Deploy a preview to Vercel (on `develop` branch)

4. **Merge once all checks pass** and get approval

## CI/CD Pipeline

### GitHub Actions

All branches have automatic checks:

- **Lint** - ESLint validation
- **Type Check** - TypeScript compiler
- **Test** - Unit tests via Bun
- **Build** - Turbo build verification

Preview deployments happen automatically for `develop` branch and pull requests.

## Branch Protection Rules

The following branches have protection enabled:

### `main` (Production)
- ✅ Requires all status checks to pass
- ✅ Requires pull request review (1 approver)
- ✅ Dismiss stale reviews
- ✅ Require code owners review (if CODEOWNERS exists)
- ✅ Dismiss reviews when new commits pushed
- ✅ Prevent merge of PRs with failing checks

### `develop` (Staging)
- ✅ Requires all status checks to pass
- ✅ Requires pull request review (1 approver)
- ✅ Auto-deploys to Vercel preview when merged

## Secrets Required

These environment variables must be set in GitHub Secrets for preview deployments:

```
VERCEL_TOKEN      # Vercel authentication token
VERCEL_ORG_ID     # Vercel organization ID
VERCEL_PROJECT_ID # Vercel project ID
```

## Testing

### Unit Tests (API)

Run tests with:
```bash
bun run test
```

Tests are located in `apps/api/src/__tests__/` and use Bun's native test runner.

### Component Tests (Web)

Coming in Phase 9 - will use Vitest for React component testing.

## Code Quality

### ESLint
```bash
bun run lint
```

Checks:
- TypeScript best practices
- React hooks rules
- Code style consistency

### TypeScript
```bash
bun run type-check
```

Ensures type safety across the codebase.

## Deployment

The app is hosted on **Cloudflare Pages** (free tier):

- **Production**: `1rupee-web.pages.dev` (from `main` branch)
- **Staging**: `develop.1rupee-web.pages.dev` (from `develop` branch)
- **Preview**: `pr-123.1rupee-web.pages.dev` (from pull requests)

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for setup and configuration.

### Deployment Checklist
- [ ] Environment variables configured in Cloudflare Pages
- [ ] API URL set correctly (`NEXT_PUBLIC_API_URL`)
- [ ] GitHub secrets configured (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
- [ ] CI pipeline passing
- [ ] No sensitive data in `.env` files (only `.env.example`)

## Making a Release

Releases are cut from the `main` branch and follow semantic versioning. Update version in `package.json` and create a git tag. Cloudflare Pages will automatically deploy to production.

## Need Help?

- Check the [Development Roadmap](docs/development-roadmap.md)
- Read [DEPLOYMENT.md](docs/DEPLOYMENT.md) for hosting questions
- Read [TESTING.md](docs/TESTING.md) for testing guide
- Read the [Phase 8 Pledge Checkout](docs/PHASE8-PLEDGE-CHECKOUT.md) for implementation details
- Ask questions in pull request discussions
