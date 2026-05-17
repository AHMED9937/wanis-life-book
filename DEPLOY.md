# Deploy Wanis Life Book (GitHub + Vercel)

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Wanis life book app"
gh repo create wanis-life-book --public --source=. --remote=origin --push
```

Use your own repo name if you prefer:

```bash
gh repo create YOUR-REPO-NAME --public --source=. --remote=origin --push
```

## 2. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import** your GitHub repository
3. Framework: **Other** (settings come from `vercel.json`)
4. Add **Environment Variables** (Production + Preview):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Your Neon/Postgres URL (`?sslmode=require`) |
| `CLERK_SECRET_KEY` | From Clerk dashboard → API Keys |
| `CLERK_PUBLISHABLE_KEY` | Same place |
| `VITE_CLERK_PUBLISHABLE_KEY` | Same as publishable key (needed at build time) |
| `NODE_ENV` | `production` |

5. Click **Deploy**

Build runs: `prisma generate` → `prisma migrate deploy` → `vite build`.

## 3. Clerk production URLs

In [Clerk Dashboard](https://dashboard.clerk.com) → your app → **Domains**:

- Add your Vercel URL: `https://your-project.vercel.app`
- Set **Home URL** and allowed redirect URLs to match

## 4. After deploy — verify

- Open the site → sign in works
- Library loads residents (API + DB)
- Search, TTS, print on a story page

## Architecture on Vercel

- **Static UI**: `dist/` (Vite build)
- **API**: `api/index.ts` → Express (`/api/residents`, `/api/stories`, `/api/tts`)
- **Database**: Neon PostgreSQL (same `DATABASE_URL` as local)

## Local development (unchanged)

```bash
npm install
cp .env.example .env   # then fill in values
npx prisma migrate deploy
npm run dev:server     # terminal 1 — port 4000
npm run dev            # terminal 2 — port 5173
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Prisma | Set `DATABASE_URL` in Vercel **before** first deploy |
| 401 on API | Check `CLERK_SECRET_KEY` on Vercel |
| Blank app / Clerk error | Set `VITE_CLERK_PUBLISHABLE_KEY` and redeploy |
| API 500 | Vercel → Project → Logs → Functions |
