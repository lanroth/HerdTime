# HerdTime — TODO

## Setup (one-time)

- [x] Create Supabase project at supabase.com
- [x] Run `supabase/migrations/001_initial.sql` in Supabase SQL editor
- [ ] Enable OAuth providers in Supabase → Authentication → Providers
  - [x] Google (needs Google Cloud OAuth credentials)
  - [ ] GitHub (needs GitHub OAuth app)
- [x] Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- [ ] Test locally with `npm run dev`

## GitHub / Deployment

- [x] Create GitHub repository
- [x] Push code to `main` branch
- [x] Add repo secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [x] Enable GitHub Pages (Settings → Pages → Source: `gh-pages` branch)
- [x] Update Supabase OAuth redirect URLs to include the GitHub Pages URL
- [x] Update footer GitHub link in `src/App.tsx` to real repo URL

## Features

- [x] Favicon / app icon
- [x] Open Graph meta tags for link previews
- [x] Deadline enforcement — hide vote form after deadline passes
- [ ] "Best date" email/notification when poll creator closes it
- [ ] Shareable image / screenshot of results grid
- [x] Mobile: make VoteGrid horizontally scrollable on small screens

## Nice to have

- [ ] Dark mode toggle
- [ ] iCal / Google Calendar export for the winning date
- [ ] Participant limit per poll
- [ ] Poll duplication ("run this poll again")
