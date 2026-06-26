# CineVerse AI — Bug Fix Guide

## Bugs Fixed in This PR

### ✅ Bug 1: Auth Callback 404 / Always redirects to /onboarding
**File:** `app/auth/callback/route.ts`
**Fix:** Now checks Prisma DB after exchanging the OAuth code:
- New user → creates Prisma User record → `/onboarding`
- Returning user with DNA → `/dashboard`
- Returning user without DNA → `/onboarding`
- Error → `/login?error=auth_failed`

### ✅ Bug 2: "Failed to load watchlist"
**Files:** `lib/ensure-user.ts` (new), `app/api/watchlist/route.ts`
**Fix:** Added `ensurePrismaUser()` safety net. If a Supabase auth user doesn't have a
matching Prisma DB row yet, it creates one before querying watchlist items.

### ✅ Bug 3 & 4: Placeholder content + AI Assistant error
**Files:** `lib/tmdb.ts`, `lib/spotify.ts`
**Fix:** Both were throwing at **module load time** if env vars were missing, crashing
the entire API route on import. Now they warn and return empty arrays gracefully.
The real fix is adding the missing env vars to Vercel (see below).

---

## 🔑 Required Vercel Environment Variables

Go to: **Vercel Dashboard → cineverse-ai-v2 → Settings → Environment Variables**

Add ALL of these:

| Variable | Where to get it | Required? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | ✅ Critical |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | ✅ Critical |
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string (Transaction mode, port 6543) | ✅ Critical |
| `OPENAI_API_KEY` | platform.openai.com → API Keys | ✅ For AI Assistant |
| `TMDB_API_KEY` | themoviedb.org → Settings → API | ✅ For movie/TV recommendations |
| `SPOTIFY_CLIENT_ID` | developer.spotify.com → Dashboard | ✅ For music recommendations |
| `SPOTIFY_CLIENT_SECRET` | developer.spotify.com → Dashboard | ✅ For music recommendations |
| `REDIS_URL` | Upstash → Your database → REST URL (use `redis://` not REST) | ⚡ For caching |

After adding all variables → **Redeploy** (Deployments tab → Redeploy).

---

## 🔐 Google OAuth Setup Checklist

In **Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client**:

Authorized redirect URIs must include:
```
https://[YOUR-SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback
```

In **Supabase → Authentication → Providers → Google**:
- Client ID: (from Google Cloud Console)
- Client Secret: (from Google Cloud Console)
- Redirect URL must match exactly

---

## 🎨 UI Design Tools (Emmanuel's picks)

For redesigning the look:

| Tool | Best for | Link |
|---|---|---|
| **v0.dev** | Generate full Next.js UI from a prompt | v0.dev |
| **Figma** | Design mockups then export to code | figma.com |
| **shadcn/ui** | Drop-in components that match your stack | ui.shadcn.com |
| **21st.dev** | Copy-paste animated components | 21st.dev |
| **Framer** | High-fidelity interactive prototypes | framer.com |

**Recommended:** Start with v0.dev — you can describe the page and it outputs
Next.js + Tailwind + shadcn code you can paste directly into your project.
