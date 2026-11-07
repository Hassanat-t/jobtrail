import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { application, statusChange } from "@/db/schema";
import type { Source } from "./sources";
import type { Status } from "./status";

// Data access for applications. Every function takes the user id from requireUser(),
// never from the client, so users only ever touch their own rows.

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const ownedBy = (userId: string, id: string) =>
  and(eq(application.id, id), eq(application.userId, userId));

export function listApplications(userId: string) {
  return db
    .select()
    .from(application)
    .where(eq(application.userId, userId))
    .orderBy(desc(application.statusChangedAt));
}

export async function getApplication(userId: string, id: string) {
  const [row] = await db.select().from(application).where(ownedBy(userId, id));
  return row ?? null;
}

/** Status history for one application, oldest first. Returns [] if it isn't the user's. */
export async function getStatusHistory(userId: string, id: string) {
  return db
    .select({
      id: statusChange.id,
      fromStatus: statusChange.fromStatus,
      toStatus: statusChange.toStatus,
      changedAt: statusChange.changedAt,
    })
    .from(statusChange)
    .innerJoin(application, eq(statusChange.applicationId, application.id))
    .where(ownedBy(userId, id))
    .orderBy(asc(statusChange.changedAt));
}

export type ApplicationInput = {
  company: string;
  title: string;
  url?: string;
  source: Source;
  location?: string;
  salary?: string;
  status: Status;
  notes?: string;
};

/** Creates an application with its first history entry. Returns the new id. */
export async function createApplication(userId: string, input: ApplicationInput): Promise<string> {
  const now = new Date();
  return db.transaction(async (tx) => {
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
    return row.id;
  });
}

/** The user's most recent application saved with exactly this link, or null. Used by the extension. */
export async function findApplicationByUrl(userId: string, url: string) {
  const [row] = await db
    .select({ id: application.id, company: application.company, title: application.title, status: application.status })
    .from(application)
    .where(and(eq(application.userId, userId), eq(application.url, url)))
    .orderBy(desc(application.createdAt))
    .limit(1);
  return row ?? null;
}

/**
 * Moves an application to a new status and logs the change.
 * Clears reminderSentAt so a fresh reminder can go out for the new stage.
 */
async function changeStatus(tx: Tx, userId: string, id: string, to: Status) {
  const [current] = await tx
    .select({ status: application.status, appliedAt: application.appliedAt })
    .from(application)
    .where(ownedBy(userId, id))
    .for("update");
  if (!current) return false;
  if (current.status === to) return true;

  const now = new Date();
  await tx
    .update(application)
    .set({
      status: to,
      statusChangedAt: now,
      reminderSentAt: null,
      appliedAt: current.appliedAt ?? (to === "saved" ? null : now),
    })
    .where(ownedBy(userId, id));
  await tx
    .insert(statusChange)
    .values({ applicationId: id, fromStatus: current.status, toStatus: to, changedAt: now });
  return true;
}

export async function moveApplication(userId: string, id: string, to: Status) {
  return db.transaction((tx) => changeStatus(tx, userId, id, to));
}

export async function updateApplication(userId: string, id: string, input: ApplicationInput) {
  const { status, ...fields } = input;
  return db.transaction(async (tx) => {
    const found = await changeStatus(tx, userId, id, status);
    if (!found) return false;
    await tx
      .update(application)
      .set({
        ...fields,
        url: fields.url ?? null,
        location: fields.location ?? null,
        salary: fields.salary ?? null,
        notes: fields.notes ?? null,
      })
      .where(ownedBy(userId, id));
    return true;
  });
}

export async function deleteApplication(userId: string, id: string) {
  await db.delete(application).where(ownedBy(userId, id));
}

/** Everything the stats page needs, for one user. */
export async function getStatsData(userId: string) {
  const [applications, changes] = await Promise.all([
    db
      .select({ id: application.id, source: application.source, status: application.status, appliedAt: application.appliedAt })
      .from(application)
      .where(eq(application.userId, userId)),
    db
      .select({ applicationId: statusChange.applicationId, toStatus: statusChange.toStatus, changedAt: statusChange.changedAt })
      .from(statusChange)
      .innerJoin(application, eq(statusChange.applicationId, application.id))
      .where(eq(application.userId, userId)),
  ]);
  return { applications, changes };
}
