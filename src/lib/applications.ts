import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { application, statusChange } from "@/db/schema";
import type { Source } from "./sources";
import type { Status } from "./status";

// Data access for applications. Every function takes the user id from requireUser(),
// never from the client, so users only ever touch their own rows.

export function listApplications(userId: string) {
  return db
    .select()
    .from(application)
    .where(eq(application.userId, userId))
    .orderBy(desc(application.statusChangedAt));
}

export type NewApplication = {
  company: string;
  title: string;
  url?: string;
  source: Source;
  location?: string;
  status: Status;
  notes?: string;
};

export async function createApplication(userId: string, input: NewApplication) {
  const now = new Date();
  await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(application)
      .values({
        ...input,
        userId,
        statusChangedAt: now,
        appliedAt: input.status === "saved" ? null : now,
      })
      .returning({ id: application.id });

    await tx
      .insert(statusChange)
      .values({ applicationId: row.id, fromStatus: null, toStatus: input.status, changedAt: now });
  });
}
