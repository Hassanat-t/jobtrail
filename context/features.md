# Features

## Status updates: Level 1 (manual)
The app does **not** read email. When a company replies, the user moves the card themselves (drag on the board or change status on the job page). Follow-up reminder emails nudge them to keep statuses current.

Email forwarding (Level 2) and Gmail sync (Level 3) are out of scope for the MVP. See [decisions.md](decisions.md).

## MVP

### Accounts
- Sign up and log in with email and password
- Log out
- Each user only ever sees their own data

### Applications
- Add a job manually: company, job title, link, source (LinkedIn, Indeed, referral, company site, other), location, salary (optional), notes
- Edit and delete a job
- Status is one of: **Saved, Applied, Interview, Offer, Rejected**
- Every status change is recorded with a timestamp (powers stats and reminders)
- Setting status to Applied records `appliedAt`

### Board
- Kanban board with one column per status
- Drag a card between columns to change its status
- Card shows company, title, source and days since last change

### Job detail page
- All fields, editable
- Notes (free text): contacts, interview prep, etc.
- Status history timeline

### Chrome extension
- Click the icon on a job page → popup pre-filled with title, company and URL
- User can edit fields, then Save
- Authenticates with a personal API token copied from the web app's settings page

### Follow-up reminders
- Once a day, find jobs in **Applied** for 7+ days with no status change and no reminder sent yet
- Email the user a list: "No reply from X after 7 days — time to follow up?"
- User can turn reminders off in settings

### Stats
- Totals per status
- Response rate: (Interview + Offer + Rejected-after-reply) / Applied
- Response rate by source
- Average days from Applied to first reply

## Out of scope for MVP
- Reading or forwarding email
- Multiple CV versions per application
- AI features
- Mobile app
- CSV import/export (nice stretch)

## User stories
- As a job seeker, I can save a job from LinkedIn in one click so I don't lose it.
- As a job seeker, I can see all my applications by stage so I know where I stand.
- As a job seeker, I get reminded to follow up so opportunities don't go cold.
- As a job seeker, I can see which sources get replies so I spend time wisely.
