# Deploying Turborepo to Cloudflare Pages

This guide covers deploying a **monorepo** with multiple apps/packages to Cloudflare Pages.

## Project Structure

```
1rupee/
├── apps/
│   ├── web/          (Next.js - deployed to Pages)
│   └── api/          (Hono - deployed separately)
├── packages/
│   └── (shared code)
├── package.json      (root workspace)
└── turbo.json        (build configuration)
```

## Why Turborepo Matters

Cloudflare Pages will try to build **everything** by default. With Turborepo, you can:
- ✅ Build only the web app (skip API)
- ✅ Share dependencies efficiently
- ✅ Cache build artifacts
- ✅ Parallel builds (for CI/CD)

## Cloudflare Pages Configuration

### Build Command
```bash
turbo build --filter=1rupee-web
```

**Breakdown:**
- `turbo` - Turborepo CLI
- `build` - Run the build task
- `--filter=1rupee-web` - Only build the `1rupee-web` package (web app)

### Output Directory
Cloudflare Pages **auto-detects** the Next.js output directory (`.next`). You typically don't need to specify it.

If the form asks for it explicitly, you can leave it empty or specify:
```
apps/web/.next
```

This is where Next.js outputs its build artifacts.

## GitHub Actions Workflow

The `.github/workflows/deploy-pages.yml` uses:

```yaml
- name: Build web app (Turborepo)
  run: turbo build --filter=1rupee-web
  env:
    NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
```

This ensures:
- Only the web app is built (not the API)
- Turbo caches are used (faster rebuilds)
- Environment variables are available

## Local Testing

To test the exact Cloudflare Pages build locally:

```bash
# Clean build (same as Pages)
rm -rf .turbo
bun install --frozen-lockfile

# Build only the web app
turbo build --filter=1rupee-web

# Check the output
ls apps/web/.next
```

## Turborepo Filters

You can use filters in many contexts:

```bash
# Build only web
turbo build --filter=1rupee-web

# Build web and its dependencies
turbo build --filter=1rupee-web...

# Build everything except API
turbo build --filter=!1rupee-api

# Lint only web
turbo lint --filter=1rupee-web
```

## turbo.json Configuration

The root `turbo.json` defines how packages relate:

```json
{
  "tasks": {
    "build": {
      "outputs": [".next/**", "dist/**"],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Key settings:**
- `outputs` - What directories to cache (speeds up rebuilds)
- `cache` - Whether to cache results
- `persistent` - For dev servers (never cache)

## Troubleshooting

### Build fails: "turbo command not found"
Cloudflare Pages uses `bun`, not `npm`:

```bash
# This won't work
npm install -g turbo

# Instead, use bun
bun run turbo build --filter=1rupee-web
```

### All packages are building (too slow)
Check your filter command - remove the typo:
```bash
# ❌ Wrong - builds everything
bun run build

# ✅ Right - builds only web
turbo build --filter=1rupee-web
```

### "1rupee-web not found"
Verify the package name in `apps/web/package.json`:
```json
{
  "name": "1rupee-web"  // This must match the filter
}
```

### Output directory is empty
Make sure Next.js build succeeded:
```bash
# Check the build output
ls -la apps/web/.next

# If empty, run locally and check logs
turbo build --filter=1rupee-web -- --verbose
```

## Performance Tips

### 1. Use Turbo Cache
Cloudflare Pages caches `.turbo` between builds (same branch):
```bash
# Avoid clearing cache unnecessarily
# Force rebuild if needed:
turbo build --filter=1rupee-web --force
```

### 2. Exclude Unnecessary Packages
If you have packages that don't affect the web build, move them out of dependencies:

```json
{
  "dependencies": {
    "@repo/shared": "*"  // ✅ Include shared code
    "@repo/api": "*"     // ❌ Don't include API
  }
}
```

### 3. Optimize Dependencies
- Remove unused packages
- Use `bun prune --prod` to remove dev dependencies
- Check `package-lock.json` size

## Migrating from Single App

If you later want to add more apps to the same Pages project:

1. Create the new app in `apps/new-app`
2. Add to `turbo.json`
3. Update filter: `turbo build --filter=1rupee-web,new-app`

To deploy multiple apps to different Pages projects:

```bash
# Each gets its own project name + filter
turbo build --filter=1rupee-web
turbo build --filter=1rupee-api  # Different Pages project
```

## Resources

- [Turborepo Filtering Docs](https://turbo.build/repo/docs/reference/command-line-reference/filter)
- [Next.js Build Output](https://nextjs.org/docs/app/api-reference/next-config-js#output)
- [Cloudflare Pages Builds](https://developers.cloudflare.com/pages/functions/bindings/environment-variables/)
