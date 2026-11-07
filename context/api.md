# API

The web app mostly uses Server Actions. These REST endpoints exist for the Chrome extension (and cron). All return JSON.

## Auth for the extension
Header: `Authorization: Bearer <api token>`. Tokens look like `jt_…`. The server stores only a SHA-256 hash and looks it up in `api_token`, updating `lastUsedAt`.

Cross-origin requests are allowed from `chrome-extension://` origins only (CORS). No cookies are involved, so websites can't use a logged-in session through these endpoints.

## Endpoints
| Method | Path | Who | What |
|---|---|---|---|
| GET | `/api/me` | extension | Check token works; returns name and email |
| POST | `/api/applications` | extension | Create a job. Body: `{ company, title, url?, source?, location?, salary?, status?, notes? }`. `source` defaults to `other`, `status` to `saved`. Returns `201 { id }` |
| GET | `/api/applications?url=` | extension | Check if this URL is already saved. Returns `{ application: { id, company, title, status } \| null }` |
| GET | `/api/cron/reminders` | Vercel Cron | Send follow-up emails. Protected by `CRON_SECRET` |
| * | `/api/auth/*` | web app | Better Auth handlers |

## Errors
`{ "error": "message" }` with status 400 (bad input), 401 (no/invalid token), 404, 500.
