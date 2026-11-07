# Decisions

Newest at the top. Format: date, decision, why.

### 2026-11-04: Local Postgres is created as UTF-8
`scripts/db.mjs` passes `--encoding=UTF8` to initdb.
**Why:** on Windows the default was WIN1252, which crashed when saving "₦". Neon is UTF-8 already, so local now matches production. If you have an old `.pgdata` folder, delete it and run `pnpm db:start` + `pnpm db:migrate` again.

### 2026-11-04: Board uses dnd-kit core with keyboard support
Space picks a card up, left/right arrows move it a column, Space drops it, Enter opens the job. Moves update the board instantly and save in the background.
**Why:** drag-and-drop must work without a mouse to meet the accessibility rules in design.md.

### 2026-11-04: Warm paper theme
Cream background, terracotta accent, Fraunces serif headings with Inter body text. Chosen from four options (Clean slate, Midnight, Warm paper, Fresh mint).
**Why:** stands out from the usual white-and-blue SaaS look and suits a personal tool. Details in [design.md](design.md).

### 2026-11-04: Status updates are manual (Level 1)
The app won't read email in the MVP. Users drag cards themselves; reminder emails nudge them.
**Why:** simplest and always accurate. Email forwarding and Gmail sync add complexity (inbound email service, Google security review) that can come later.

### 2026-11-04: Project lives at `C:\Users\hassa\jobtrail`
**Why:** outside OneDrive so `node_modules` isn't synced; separate from Zedu work.

### 2026-11-04: Local Postgres via embedded-postgres
**Why:** no Docker on this machine; same approach already works for Ziki.

### 2026-11-04: Better Auth with email + password
**Why:** no third-party OAuth app needed to get started; integrates with Drizzle.

### 2026-11-04: Build #2 (job tracker) over #1 (standup tool)
**Why:** the Chrome extension stands out on a CV, it's usable by one person from day one, and it produces real numbers to quote.
