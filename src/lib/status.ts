// Application statuses, in board order. Colours come from the theme tokens in globals.css.
export const STATUSES = [
  { id: "saved", label: "Saved", dot: "bg-status-saved", text: "text-status-saved" },
  { id: "applied", label: "Applied", dot: "bg-status-applied", text: "text-status-applied" },
  { id: "interview", label: "Interview", dot: "bg-status-interview", text: "text-status-interview" },
  { id: "offer", label: "Offer", dot: "bg-status-offer", text: "text-status-offer" },
  { id: "rejected", label: "Rejected", dot: "bg-status-rejected", text: "text-status-rejected" },
] as const;

export type Status = (typeof STATUSES)[number]["id"];
