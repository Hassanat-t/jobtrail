// Validation for job input, shared by the web forms (server actions) and the extension API.
import { z } from "zod";
import { SOURCES } from "./sources";
import { STATUSES } from "./status";

const optional = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .nullable()
  .transform((v) => v || undefined);

export const statusSchema = z.enum(STATUSES.map((s) => s.id));
export const sourceSchema = z.enum(SOURCES.map((s) => s.id));

export const urlSchema = z
  .union([z.literal(""), z.url({ protocol: /^https?$/, error: "Enter a full link, starting with https://" })])
  .optional()
  .nullable()
  .transform((v) => v || undefined);

export const jobSchema = z.object({
  company: z.string().trim().min(1, "Enter the company name").max(200),
  title: z.string().trim().min(1, "Enter the job title").max(200),
  url: urlSchema,
  source: sourceSchema,
  location: optional,
  salary: optional,
  status: statusSchema,
  notes: optional,
});

/** The extension sends less: source and status get sensible defaults. */
export const apiJobSchema = jobSchema.extend({
  source: sourceSchema.default("other"),
  status: statusSchema.default("saved"),
});

export const idSchema = z.uuid();
