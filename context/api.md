# API

The web app mostly uses Server Actions. These REST endpoints exist for the Chrome extension (and cron). All return JSON.

## Auth for the extension
Header: `Authorization: Bearer <api token>`. The server hashes the token and looks it up in `api_token`.

## Endpoints
| Method | Path | Who | What |
|---|---|---|---|
| GET | `/api/me` | extension | Check token works; returns name and email |
| POST | `/api/applications` | extension | Create a job. Body: `{ company, title, url?, source?, notes? }` |
| GET | `/api/applications?url=` | extension | Check if this URL is already saved |
| GET | `/api/cron/reminders` | Vercel Cron | Send follow-up emails. Protected by `CRON_SECRET` |
| * | `/api/auth/*` | web app | Better Auth handlers |

## Errors
`{ "error": "message" }` with status 400 (bad input), 401 (no/invalid token), 404, 500.
