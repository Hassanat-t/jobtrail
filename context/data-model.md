# Data model

Auth tables (`user`, `session`, `account`, `verification`) are created by Better Auth and not listed in full here.

## user (from Better Auth, plus our fields)
| Field | Type | Notes |
|---|---|---|
| id | text | PK |
| name | text | |
| email | text | unique |
| remindersEnabled | boolean | default true |
| createdAt | timestamp | |

## application
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| userId | text | FK → user, cascade delete |
| company | text | required |
| title | text | required |
| url | text | optional |
| source | enum | linkedin, indeed, referral, company_site, other |
| location | text | optional |
| salary | text | optional, free text ("₦400k/month", "$60k") |
| status | enum | saved, applied, interview, offer, rejected |
| notes | text | optional |
| appliedAt | timestamp | set when status first becomes applied |
| statusChangedAt | timestamp | last status change, used for "days in stage" |
| reminderSentAt | timestamp | null until a follow-up reminder is sent |
| createdAt / updatedAt | timestamp | |

## status_change
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| applicationId | uuid | FK → application, cascade delete |
| fromStatus | enum | null for the first entry |
| toStatus | enum | |
| changedAt | timestamp | |

## api_token
| Field | Type | Notes |
|---|---|---|
| id | uuid | PK |
| userId | text | FK → user |
| tokenHash | text | store a hash, never the raw token |
| name | text | e.g. "Chrome on laptop" |
| lastUsedAt | timestamp | |
| createdAt | timestamp | |

## Rules
- Every query on `application` filters by the logged-in `userId`.
- Changing `status` always inserts a `status_change` row in the same transaction.
