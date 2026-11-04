# User flows

## First visit
1. Landing page explains the app → **Sign up**
2. Enter name, email, password → lands on an empty board with a hint: "Add your first job"

## Add a job (web)
1. Board → **Add job** button
2. Form: company, title, link, source, status (default Saved), notes
3. Save → card appears in the right column

## Add a job (extension)
1. One-time setup: Settings → **Create API token** → copy → paste into extension
2. On a job page, click the extension icon
3. Popup shows title, company, URL (pre-filled; editable)
4. **Save** → "Saved to JobTrail" with a link to open it

## Update after a reply
1. Company replies by email
2. User opens the board and drags the card to **Interview** or **Rejected**
3. Status history records the change

## Follow-up reminder
1. Daily job finds stale Applied jobs (7+ days)
2. User gets an email listing them, each with a link to the job page
3. User follows up with the company, then adds a note or moves the card

## Check progress
1. **Stats** page → totals, response rate, best sources, average reply time
