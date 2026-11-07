# JobTrail

Track every job application, from saved to signed. Save jobs in one click, move them through each stage, and get reminded to follow up.

> Work in progress. See [context/roadmap.md](context/roadmap.md) for what's built and what's next.

## Stack
Next.js 16 · TypeScript · Tailwind CSS · PostgreSQL · Drizzle ORM · Better Auth · dnd-kit · Resend · Vitest · Playwright · GitHub Actions

## Run it locally
Needs Node 22+ and pnpm.

```bash
pnpm install
cp .env.example .env      # then set BETTER_AUTH_SECRET to a long random string
pnpm db:start             # local Postgres on port 5434, leave it running
pnpm db:migrate           # in a second terminal
pnpm dev                  # http://localhost:3020
```

## Chrome extension
1. Run the app, log in, open **Settings** and create a token.
2. In Chrome, go to `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and pick the `extension/` folder.
3. Click the JobTrail icon, paste the token (the address is `http://localhost:3020` locally) and connect.
4. On any job page, click the icon, check the details and **Save to JobTrail**.

## Reminder emails
Once a day Vercel Cron calls `/api/cron/reminders` (see `vercel.json`). It emails users about jobs that have sat in **Applied** for 7+ days. Locally, with `RESEND_API_KEY` empty, the email is printed in the terminal instead. To trigger it by hand:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3020/api/cron/reminders
```

## Scripts
| Command | What it does |
|---|---|
| `pnpm dev` | Start the app on port 3020 |
| `pnpm db:start` | Start local Postgres (no Docker needed) |
| `pnpm db:generate` | Create a migration after changing `src/db/schema.ts` |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:studio` | Browse the database |
| `pnpm test` | Unit tests (Vitest): stats, validation, reminder email, extension page parser |
| `pnpm test:e2e` | End-to-end test (Playwright): sign up → add job → move it → stats → extension API → delete. Run `pnpm exec playwright install chromium` once first |
| `pnpm icons` | Redraw the extension icons |
| `pnpm typecheck` / `pnpm lint` | Checks |

## Project docs
Everything about what's being built and why lives in [context/](context/README.md).
