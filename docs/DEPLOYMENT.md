# Deployment Guide

> ⚠️ **Outdated.** The web app now deploys to **Cloudflare Workers** via the
> OpenNext adapter, not Cloudflare Pages. See
> [CLOUDFLARE_SETUP.md](../CLOUDFLARE_SETUP.md) for the current flow. The Pages
> instructions below are kept only for historical reference.

## Legacy Setup: Cloudflare Pages (Free Tier)

This guide covers deploying 1Rupee to Cloudflare Pages under the free tier.

### Architecture

```
┌─────────────────────────────────────────┐
│   Your Domain (or *.pages.dev)          │
│   (Cloudflare Pages - Free)             │
├─────────────────────────────────────────┤
│   Next.js Web App                       │
│   - UI, auth pages, dashboard           │
│   - API proxy to backend                │
├─────────────────────────────────────────┤
│   Hono API (separate deployment)        │
│   - Connect via NEXT_PUBLIC_API_URL     │
├─────────────────────────────────────────┤
│   Neon PostgreSQL (already connected)   │
└─────────────────────────────────────────┘
```

## Step 1: Create Cloudflare Pages Project

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sign up for free (no credit card needed)
3. Go to **Pages**
4. Click **Create a project**
5. Select **Connect to Git** → **GitHub**
6. Authorize Cloudflare with GitHub
7. Select this repository: `ayushsaranGithuB/1rupee` (or your fork)
8. Click **Begin setup**

## Step 2: Configure Build Settings

In the Cloudflare Pages setup form:

**Project name:** `1rupee-web`

**Production branch:** `main`

**Build command:**
```bash
bun install --frozen-lockfile && bun run build
```

**Build output directory:**
```
apps/web/.next
```

**Environment variables:**
```
NEXT_PUBLIC_API_URL = http://localhost:3001  (initially, until API deployed)
NODE_ENV = production
```

Click **Save and Deploy**

## Step 3: Get Your Cloudflare Credentials

For GitHub Actions automation, you need:

1. **API Token:** 
   - Go to [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Click **Create Token**
   - Use template: **Cloudflare Pages**
   - Grant permissions for your account
   - Copy the token

2. **Account ID:**
   - In Cloudflare dashboard, bottom right corner
   - Copy your Account ID

## Step 4: Add GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:
- `CLOUDFLARE_API_TOKEN` = (paste your API token)
- `CLOUDFLARE_ACCOUNT_ID` = (paste your account ID)
- `NEXT_PUBLIC_API_URL` = (your API URL - see Step 5)

## Step 5: Deploy the API

Your API needs to be accessible from the web app. Options:

### Option A: Keep Current Setup (Recommended for now)
If you're already running the API somewhere, just update:
- `NEXT_PUBLIC_API_URL` to point to it

### Option B: Deploy to Cloudflare Workers (Free tier)
Coming soon - we can upgrade to this later for better integration.

### Option C: Deploy to Vercel
```bash
cd apps/api
vercel deploy
```
Then set `NEXT_PUBLIC_API_URL` to the Vercel URL.

## Step 6: Update Environment Variables

Once API is deployed, update the environment variable in Cloudflare Pages:

1. Go to Pages → **1rupee-web** → **Settings** → **Environment variables**
2. Add production variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-api-domain.com`

## Deployment Flow

After setup, deployments happen automatically:

- **Push to `main`** → Deploys to production at `1rupee-web.pages.dev`
- **Push to `develop`** → Deploys to preview at `develop.1rupee-web.pages.dev`
- **Open PR** → Creates preview at `pr-123.1rupee-web.pages.dev`

All automatically via GitHub Actions.

## Free Tier Limits

| Resource | Limit | Cost to Upgrade |
|----------|-------|---|
| **Pages builds** | Unlimited | (included) |
| **Bandwidth** | Unlimited | (included) |
| **Preview deployments** | Unlimited | (included) |
| **Custom domains** | 1 | Free |
| **Workers** | 100K req/day | $5/month for 10M req |
| **KV storage** | 1GB | Free |

## Testing Domains (No Domain Needed)

While testing, you get free subdomains:
- Production: `1rupee-web.pages.dev`
- Develop: `develop.1rupee-web.pages.dev`
- Pull requests: `pr-123.1rupee-web.pages.dev`

## Adding Your Own Domain (Later)

When ready:
1. Buy domain (Namecheap, GoDaddy, etc.)
2. Update nameservers to Cloudflare (free)
3. In Cloudflare Pages → Custom domain → add your domain
4. Done! HTTPS included.

## Troubleshooting

### Build fails with "bun not found"
Pages runs with `npm` by default. Add to environment variables:
```
CI = ""
```

### API calls return 404
Check `NEXT_PUBLIC_API_URL` in:
1. Pages environment variables
2. `.env.local` on your machine
3. CI/CD secrets in GitHub

### Pages shows outdated version
Clear cache: Pages → Deployments → click latest → **Retry deployment**

## Monitoring

- **Analytics:** Cloudflare Pages dashboard shows request stats
- **Logs:** Click any deployment to see build logs
- **Status:** Check [status.1rupee.pages.dev](https://status.1rupee.pages.dev) (custom status page - future)

## Next Steps

1. ✅ Cloudflare Pages (web app) - Current
2. ⏭️ Cloudflare Workers (API) - When you need more power
3. ⏭️ Custom domain - When going public
4. ⏭️ Database backups - When critical

See [development-roadmap.md](development-roadmap.md) for full roadmap.
