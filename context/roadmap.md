# Roadmap

## Week 1: Foundation
- [x] Context docs
- [x] Choose theme (Warm paper)
- [x] Scaffold Next.js app with theme + landing page
- [x] Local Postgres + Drizzle schema + migrations
- [x] Sign up / log in / log out
- [x] Add job form + simple list
- [x] Git repo + first commit

## Week 2: Core product
- [x] Kanban board with drag and drop (mouse, touch and keyboard)
- [x] Status history recorded on every change
- [x] Job detail page (edit, notes, timeline)
- [x] Delete job

## Week 3: Chrome extension
- [x] API token creation in settings
- [x] REST endpoints for the extension
- [x] Extension popup: read page, pre-fill, save
- [x] LinkedIn and Indeed page parsing, with fallback to job data on the page, then page title + URL
- [ ] Try the parser on real LinkedIn and Indeed pages (tests use hand-written sample pages)

## Week 4: Reminders, stats, launch
- [ ] Daily reminder cron + Resend email
- [ ] Stats page with charts
- [ ] Tests (Vitest + Playwright) and GitHub Actions CI
- [ ] Deploy to Vercel + Neon
- [ ] README with screenshots and demo GIF

## Later (maybe)
- Email forwarding to auto-suggest status (Level 2)
- Gmail sync (Level 3)
- CSV export, CV version tracking
