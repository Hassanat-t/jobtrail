// Where a job was found. Matches application_source in src/db/schema.ts.
export const SOURCES = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "indeed", label: "Indeed" },
  { id: "referral", label: "Referral" },
  { id: "company_site", label: "Company site" },
  { id: "other", label: "Other" },
] as const;

export type Source = (typeof SOURCES)[number]["id"];

export const sourceLabel = (id: Source) => SOURCES.find((s) => s.id === id)?.label ?? "Other";
