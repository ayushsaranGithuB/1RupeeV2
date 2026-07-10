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
   - Deploy a preview to Cloudflare Workers (on pull requests)

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
- ✅ Deploys a Cloudflare Workers preview on pull requests

## Secrets Required

These must be set in GitHub Secrets for deployments:

```
CLOUDFLARE_API_TOKEN   # Token with Workers Scripts:Edit permission
CLOUDFLARE_ACCOUNT_ID  # Cloudflare account ID
NEXT_PUBLIC_API_URL    # (optional) build-time public API URL
NEXT_PUBLIC_APP_URL    # (optional) build-time public app origin
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

The web app runs on **Cloudflare Workers** via the OpenNext adapter:

- **Production**: `1rupee-web.<subdomain>.workers.dev` (from `main` branch)
- Auto-deployed by [`.github/workflows/deploy-workers.yml`](.github/workflows/deploy-workers.yml) on push to `main`.

See [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md) for setup and configuration.

### Deployment Checklist
- [ ] Runtime vars/secrets configured on the Worker (e.g. `API_URL`)
- [ ] Build-time public vars set (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`)
- [ ] GitHub secrets configured (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
- [ ] CI pipeline passing
- [ ] No sensitive data in `.env` files (only `.env.example`)

## Making a Release

Releases are cut from the `main` branch and follow semantic versioning. Update version in `package.json` and create a git tag. Cloudflare Workers will automatically deploy to production.

## Need Help?

- Check the [Development Roadmap](docs/development-roadmap.md)
- Read [DEPLOYMENT.md](docs/DEPLOYMENT.md) for hosting questions
- Read [TESTING.md](docs/TESTING.md) for testing guide
- Read the [Phase 8 Pledge Checkout](docs/PHASE8-PLEDGE-CHECKOUT.md) for implementation details
- Ask questions in pull request discussions
