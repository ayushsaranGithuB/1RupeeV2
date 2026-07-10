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

4. **Merge once all checks pass** and get approval

## CI/CD Pipeline

### GitHub Actions

All branches have automatic checks:

- **Lint** - ESLint validation
- **Type Check** - TypeScript compiler
- **Test** - Unit tests via Bun
- **Build** - Turbo build verification

Deployment is manual via `flyctl` — see [FLY_DEPLOY.md](FLY_DEPLOY.md).

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

## Deployment Secrets

Deploys run locally via `flyctl` (`fly auth login`). Runtime secrets live on the
Fly apps, not in GitHub — set them with `fly secrets set` (see
[FLY_DEPLOY.md](FLY_DEPLOY.md)):

```
DATABASE_URL         # Postgres connection string (api)
BETTER_AUTH_SECRET   # Auth signing secret (api)
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

The app runs on **Fly.io** as two containers — `1rupee-web` (Next.js, public)
and `1rupee-api` (Bun/Hono, private, reached over `.internal`). Deploys are
manual via `flyctl`:

```bash
fly deploy -c fly.api.toml   # API first
fly deploy -c fly.web.toml   # then web
```

See [FLY_DEPLOY.md](FLY_DEPLOY.md) for full setup and configuration.

### Deployment Checklist
- [ ] API secrets set on Fly (`DATABASE_URL`, `BETTER_AUTH_SECRET`, ...)
- [ ] Build-time public vars set (`NEXT_PUBLIC_*` via `[build.args]`)
- [ ] `bun run build` passes locally
- [ ] No sensitive data in `.env` files (only `.env.example`)

## Making a Release

Releases are cut from the `main` branch and follow semantic versioning. Update version in `package.json` and create a git tag, then `fly deploy` the affected apps.

## Need Help?

- Check the [Development Roadmap](docs/development-roadmap.md)
- Read [DEPLOYMENT.md](docs/DEPLOYMENT.md) for hosting questions
- Read [TESTING.md](docs/TESTING.md) for testing guide
- Read the [Phase 8 Pledge Checkout](docs/PHASE8-PLEDGE-CHECKOUT.md) for implementation details
- Ask questions in pull request discussions
