# Decisions

Newest at the top. Format: date, decision, why.

### 2026-11-07: Chrome extension is plain JavaScript, no build step
`extension/` holds `manifest.json`, `popup.html/css/js` and `parse.js`. Load it with Chrome → Extensions → Load unpacked.
**Why:** the popup is one small form. Vite + React (the original plan) would add a build step and a bundle for no real gain, and plain files can be loaded straight into Chrome. The page parser is still unit-tested with Vitest.

### 2026-11-07: Page parser tries site selectors, then schema.org JobPosting, then the page title
**Why:** LinkedIn and Indeed change their markup often. Most career sites (and many boards) include JobPosting data, and the page title nearly always has the role and company, so there's always something to pre-fill. Links are saved in one clean form (e.g. `linkedin.com/jobs/view/<id>/`) so "already saved" checks work.

### 2026-11-07: API tokens are random and stored as SHA-256 hashes
Shown once when created; revoking deletes the row.
**Why:** tokens are 24 random bytes, so a fast hash is enough (no need for bcrypt), and a database leak doesn't expose usable tokens.

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
