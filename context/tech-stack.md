# Tech stack

| Area | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Same stack as Zedu work; full-stack in one project |
| Styling | Tailwind CSS | Fast to build, easy to theme with CSS variables |
| UI components | shadcn/ui | Accessible, copy-in components that follow our theme |
| Database | PostgreSQL | Industry standard; free hosted options |
| ORM | Drizzle | Type-safe, SQL-like, lightweight migrations |
| Auth | Better Auth (email + password) | Modern, works with Drizzle, no third-party account needed |
| Drag and drop | dnd-kit | Accessible, works with React 19 |
| Charts | Recharts | Simple React charts for the stats page |
| Email | Resend | Free tier, simple API |
| Scheduled jobs | Vercel Cron | Calls an API route once a day |
| Extension | Chrome Manifest V3, Vite + React | Separate folder in the same repo |
| Tests | Vitest (unit), Playwright (end-to-end) | Fast, standard |
| CI | GitHub Actions | Lint, type-check, test on every push |
| Hosting | Vercel (app) + Neon (Postgres) | Both free to start |
| Package manager | pnpm | Already installed |

## Local development
- No Docker on this machine, so local Postgres runs with `embedded-postgres` (same approach as the Ziki setup).
- Ports: app on 3020 (3000–3011 are used by other projects), Postgres on 5434 (5433 is used by Ziki).
- Next.js 16.4 with Tailwind v4. Read `AGENTS.md`: this Next.js version ships its own docs in `node_modules/next/dist/docs/`.

## Repo layout (planned)
```
jobtrail/
  context/        project docs (this folder)
  src/            Next.js app
  extension/      Chrome extension
  scripts/        local dev helpers (e.g. start Postgres)
  drizzle/        database migrations
```
