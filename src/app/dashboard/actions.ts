"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createApplication,
  deleteApplication,
  moveApplication,
  updateApplication,
} from "@/lib/applications";
import { requireUser } from "@/lib/auth";
import { SOURCES } from "@/lib/sources";
import { STATUSES } from "@/lib/status";

export type JobFormState = { error?: string; ok?: boolean };

const optional = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || undefined);

const statusSchema = z.enum(STATUSES.map((s) => s.id));

const jobSchema = z.object({
  company: z.string().trim().min(1, "Enter the company name"),
  title: z.string().trim().min(1, "Enter the job title"),
  url: z
    .union([z.literal(""), z.url("Enter a full link, starting with https://")])
    .optional()
    .transform((v) => v || undefined),
  source: z.enum(SOURCES.map((s) => s.id)),
  location: optional,
  salary: optional,
  status: statusSchema,
  notes: optional,
});

const idSchema = z.uuid();

export async function addJob(_prev: JobFormState, formData: FormData): Promise<JobFormState> {
  const user = await requireUser();
  const parsed = jobSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await createApplication(user.id, parsed.data);
  refresh();
  return { ok: true };
}

export async function updateJob(
  id: string,
  _prev: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const user = await requireUser();
  const parsed = jobSchema.safeParse(Object.fromEntries(formData));
  if (!idSchema.safeParse(id).success) return { error: "That job couldn't be found." };
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const found = await updateApplication(user.id, id, parsed.data);
  if (!found) return { error: "That job couldn't be found." };
  refresh();
  return { ok: true };
}

/** Called by the board when a card is dropped in another column. */
export async function moveJob(id: string, status: string) {
  const user = await requireUser();
  const parsedStatus = statusSchema.safeParse(status);
  if (!idSchema.safeParse(id).success || !parsedStatus.success) {
    throw new Error("Invalid move");
  }
  await moveApplication(user.id, id, parsedStatus.data);
  refresh();
}

export async function deleteJob(id: string) {
  const user = await requireUser();
  if (idSchema.safeParse(id).success) await deleteApplication(user.id, id);
  redirect("/dashboard");
}
