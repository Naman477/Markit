# MarkIt — Smart Bookmark Manager

A real-time bookmark manager built with **Next.js 15** (App Router), **Supabase** (Auth + Database + Realtime), and **Tailwind CSS v4**.

Live URL: _paste your Vercel deployment link here_

---

## Features

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Sign up / log in with email or Google | ✅ |
| 2 | Add a bookmark (URL + title) | ✅ |
| 3 | Bookmarks private to each user (RLS) | ✅ |
| 4 | Real-time sync across tabs | ✅ |
| 5 | Delete bookmarks | ✅ |
| 6 | Deployed on Vercel | ⬜ |

---

## Getting started

### 1. Clone & install

```bash
git clone <repo-url>
cd abstrabit
npm install
```

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Grab your **Project URL** and **anon public key** from **Settings → API**.
3. Copy `.env.local.example` (or create `.env.local`) and fill in the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Database setup

Open the **SQL Editor** in your Supabase dashboard and run everything in `supabase/migration.sql`. This creates the `bookmarks` table, enables RLS, and turns on Realtime for the table.

### 4. Enable Google OAuth

1. In **Supabase → Authentication → Providers**, enable **Google**.
2. Create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
3. Set the redirect URI to `https://<your-supabase-ref>.supabase.co/auth/v1/callback`.
4. Paste the Client ID / Secret back into the Supabase Google provider settings.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import the repo on [vercel.com](https://vercel.com).
3. Add the two env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Deploy!
5. Update the Google OAuth redirect URI if your domain changes.

---

## Problems I ran into and how I solved them

### Cookie handling in Server Components
Supabase's `setAll` callback throws when called inside a read-only Server Component (headers can't be modified). I wrapped the call in a `try/catch` and let the middleware handle the token refresh instead. 

### Realtime duplicates
When you insert a bookmark, the server response arrives before the Realtime event fires. This caused a brief duplicate. I added a guard in the `INSERT` handler that checks `prev.some(b => b.id === newId)` before appending.

### Row Level Security blocking inserts
I initially forgot to include `user_id` in the insert payload — RLS rejected every request with a generic "new row violates policy" error. Adding `user_id: userId` to the insert object fixed it instantly.

---

## Tech stack

- **Next.js 15** — App Router, Server Components, Middleware
- **Supabase** — Auth (email + Google OAuth), Postgres database, Realtime subscriptions
- **Tailwind CSS v4** — Utility-first styling
- **Vercel** — Hosting & CI/CD
