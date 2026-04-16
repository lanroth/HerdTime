# HerdTime

**[https://lanroth.github.io/HerdTime/](https://lanroth.github.io/HerdTime/)**

A free, open-source date polling app — like Doodle or Rallly, hosted on GitHub Pages with Supabase as the backend.

## Features

- Create polls with multiple date options
- Vote without an account (anonymous via tokens)
- Optional sign-in (Google, GitHub, or email magic link) for a personal dashboard
- Deadline enforcement — voting closes automatically after a set date
- Mobile-friendly, horizontally scrollable vote grid

## Tech stack

- React 18 + Vite
- shadcn/ui + Tailwind CSS v3
- TanStack Query v5
- Supabase (auth + database + realtime)
- react-day-picker v9
- HashRouter for GitHub Pages SPA routing

## Getting started

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial.sql` in the Supabase SQL editor
3. Enable OAuth providers under **Authentication → Providers** (Google and/or GitHub)

### 2. Configure environment variables

```sh
cp .env.example .env
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project settings.

### 3. Run locally

```sh
npm install
npm run dev
```

## Deployment (GitHub Pages)

1. Push to the `main` branch of your GitHub repository
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository secrets
3. Enable GitHub Pages under **Settings → Pages**, source: `gh-pages` branch
4. The included `.github/workflows/deploy.yml` handles builds and deploys automatically
5. Add the GitHub Pages URL to your Supabase OAuth redirect URLs

## Auth model

- **Anonymous users** — poll admin and voter tokens are stored in `localStorage`
- **Signed-in users** — get a dashboard with all their polls, plus edit/delete via Supabase RLS

## License

MIT
