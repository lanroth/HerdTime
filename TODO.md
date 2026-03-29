# HerdTime — TODO

## Setup (one-time)

- [ ] Create Supabase project at supabase.com
- [ ] Run `supabase/migrations/001_initial.sql` in Supabase SQL editor
- [ ] Enable OAuth providers in Supabase → Authentication → Providers
  - [ ] Google (needs Google Cloud OAuth credentials)
  - [ ] GitHub (needs GitHub OAuth app)
- [ ] Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- [ ] Test locally with `npm run dev`

## GitHub / Deployment

- [ ] Create GitHub repository
- [ ] Push code to `main` branch
- [ ] Add repo secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [ ] Enable GitHub Pages (Settings → Pages → Source: `gh-pages` branch)
- [ ] Update Supabase OAuth redirect URLs to include the GitHub Pages URL
- [ ] Update footer GitHub link in `src/App.tsx` to real repo URL

## Features

- [ ] Favicon / app icon
- [ ] Open Graph meta tags for link previews
- [ ] Deadline enforcement — hide vote form after deadline passes
- [ ] "Best date" email/notification when poll creator closes it
- [ ] Shareable image / screenshot of results grid
- [ ] Mobile: make VoteGrid horizontally scrollable on small screens

## Nice to have

- [ ] Dark mode toggle
- [ ] iCal / Google Calendar export for the winning date
- [ ] Participant limit per poll
- [ ] Poll duplication ("run this poll again")
