"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { createApplication } from "@/lib/applications";
import { requireUser } from "@/lib/auth";
import { SOURCES } from "@/lib/sources";
import { STATUSES } from "@/lib/status";

export type AddJobState = { error?: string; ok?: boolean };

const optional = z
  .string()
  .trim()
  .transform((v) => v || undefined);

const addJobSchema = z.object({
  company: z.string().trim().min(1, "Enter the company name"),
  title: z.string().trim().min(1, "Enter the job title"),
  url: z.union([z.literal(""), z.url("Enter a full link, starting with https://")]).transform((v) => v || undefined),
  source: z.enum(SOURCES.map((s) => s.id)),
  location: optional,
  status: z.enum(STATUSES.map((s) => s.id)),
  notes: optional,
});

export async function addJob(_prev: AddJobState, formData: FormData): Promise<AddJobState> {
  const user = await requireUser();
  const parsed = addJobSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await createApplication(user.id, parsed.data);
  refresh();
  return { ok: true };
}
