# Design

## Theme: Warm paper
Calm and personal, like a well-kept notebook. Cream paper, terracotta accent, serif headings.

- **Mode:** light first. Dark ("evening paper") tokens are defined and follow the system setting.
- **Fonts:** Fraunces (serif) for headings, company names and the logo. Inter (sans) for everything else. Both via `next/font/google`.
- **Corner radius:** 10px cards, 8px inputs, fully rounded (pill) buttons.
- **Shadows:** almost none. Separate things with borders and paper tones, not shadows.

## Colour tokens
Defined as CSS variables in `src/app/globals.css` and exposed to Tailwind. Never hard-code hex values in components.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | #FAF7F2 | #1C1917 | Page |
| `--surface` | #FFFDF9 | #292524 | Cards, inputs |
| `--surface-muted` | #F3EDE4 | #231F1D | Board columns, subtle panels |
| `--border` | #E7E0D6 | #44403C | Hairlines |
| `--foreground` | #292524 | #F5F0E8 | Body text |
| `--muted` | #78716C | #A8A29E | Secondary text |
| `--primary` | #C2410C | #EA7C4B | Main buttons, links, focus |
| `--primary-hover` | #9A3412 | #F09466 | Hover on primary |
| `--primary-foreground` | #FFFFFF | #1C1917 | Text on primary |
| `--primary-soft` | #FFEDD5 | #431407 | Tinted highlights |
| `--primary-soft-foreground` | #7C2D12 | #FED7AA | Text on primary-soft |

## Status colours
Muted, earthy tones so they sit well on cream. Same colour for a status everywhere (column dot, badge, chart).

| Status | Light | Dark |
|---|---|---|
| Saved | #78716C stone | #A8A29E |
| Applied | #3B6EA5 ink blue | #7FA7D6 |
| Interview | #B45309 amber | #F0A85A |
| Offer | #3F7D4E sage green | #7DBB8A |
| Rejected | #A8433A brick | #E08A80 |

## UI rules
- Mobile-friendly: board scrolls horizontally on small screens; everything else stacks
- Status colours are consistent everywhere (board column, badges, charts)
- Accessible: visible focus ring in `--primary`, keyboard drag-and-drop (dnd-kit), contrast AA or better
- Empty states always tell the user what to do next
- Copy: sentence case, short, friendly ("Add your first job", not "No Data Found")
