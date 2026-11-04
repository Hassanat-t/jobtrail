# JobTrail

Track every job application, from saved to signed. Save jobs in one click, move them through each stage, and get reminded to follow up.

> Work in progress. See [context/roadmap.md](context/roadmap.md) for what's built and what's next.

## Stack
Next.js 16 · TypeScript · Tailwind CSS · PostgreSQL · Drizzle ORM · Better Auth

## Run it locally
Needs Node 22+ and pnpm.

```bash
pnpm install
cp .env.example .env      # then set BETTER_AUTH_SECRET to a long random string
pnpm db:start             # local Postgres on port 5434, leave it running
pnpm db:migrate           # in a second terminal
pnpm dev                  # http://localhost:3020
```

## Scripts
| Command | What it does |
|---|---|
| `pnpm dev` | Start the app on port 3020 |
| `pnpm db:start` | Start local Postgres (no Docker needed) |
| `pnpm db:generate` | Create a migration after changing `src/db/schema.ts` |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:studio` | Browse the database |
| `pnpm typecheck` / `pnpm lint` | Checks |

## Project docs
Everything about what's being built and why lives in [context/](context/README.md).
