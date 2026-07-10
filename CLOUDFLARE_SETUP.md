# Cloudflare Pages Setup - Quick Start

Deploy 1Rupee to Cloudflare Pages in 5 minutes. **No credit card needed. Uses free tier.**

## Quick Steps

### 1️⃣ Create Cloudflare Account
- Go to https://dash.cloudflare.com
- Sign up (free)
- Skip domain for now

### 2️⃣ Create Pages Project
- Go to **Pages** in sidebar
- Click **Create a project**
- Select **Connect to Git**
- Authorize with GitHub
- Choose this repo
- Click **Begin setup**

### 3️⃣ Configure Build

Use these exact settings:

```
Project name:     1rupee-web
Production branch: main
Build command:    bun install --frozen-lockfile && bun run build
Output directory: apps/web/.next
```

**Environment Variables:**
```
NEXT_PUBLIC_API_URL = http://localhost:3001
```

Click **Save and Deploy**

✅ **Your web app is now live at `1rupee-web.pages.dev`** 🎉

### 4️⃣ Setup Auto-Deployments (Optional)

To enable automatic GitHub Actions deployments:

1. Get your credentials:
   - Account ID: https://dash.cloudflare.com/profile/overview (bottom right)
   - API Token: https://dash.cloudflare.com/profile/api-tokens (Create Token → Cloudflare Pages)

2. Go to GitHub repo **Settings** → **Secrets and variables** → **Actions**

3. Add these secrets:
   ```
   CLOUDFLARE_API_TOKEN = <your-token>
   CLOUDFLARE_ACCOUNT_ID = <your-id>
   ```

Now every push to `main` or `develop` automatically deploys. ✨

### 5️⃣ Connect Your API

Your API needs to be deployed somewhere. For now:

**Option A (Easiest):** Keep API running locally
- Just use `http://localhost:3001` for testing

**Option B (Better):** Deploy API to Vercel
```bash
cd apps/api
vercel deploy
# Copy the URL
```
Then update in Cloudflare Pages:
- Settings → Environment variables
- Update `NEXT_PUBLIC_API_URL` to your API URL

## Free Tier Features

✅ Unlimited builds  
✅ Unlimited bandwidth  
✅ Unlimited preview deployments  
✅ Free subdomain (*.pages.dev)  
✅ HTTPS included  
✅ Global CDN  

## Your Subdomains

While testing (before custom domain):
- **Production**: `1rupee-web.pages.dev`
- **Staging**: `develop.1rupee-web.pages.dev` (if you push to `develop` branch)
- **PRs**: `pr-<number>.1rupee-web.pages.dev`

## Adding Custom Domain Later

When you buy a domain:
1. In Cloudflare Pages → Custom Domain
2. Add your domain
3. Update nameservers (Cloudflare will show instructions)
4. Done! No cost, HTTPS auto-enabled.

## Troubleshooting

**Build fails?**
- Check build logs in Cloudflare Pages dashboard
- Ensure `bun` is installed locally: `bun --version`
- Run `bun run build` locally to test

**API not responding?**
- Check `NEXT_PUBLIC_API_URL` in environment variables
- Ensure API server is running
- Check browser console for CORS errors

**Out of sync with GitHub?**
- Click "Retry deployment" on the latest build
- Or push a dummy commit: `git commit --allow-empty -m "Trigger deploy"`

## Next Steps

- ✅ Web app deployed
- ⏭️ Deploy API to Cloudflare Workers (for better integration)
- ⏭️ Add custom domain
- ⏭️ Set up monitoring

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for more details and advanced config.
