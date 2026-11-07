import "server-only";
import { and, eq, inArray, isNull, lte } from "drizzle-orm";
import { db } from "@/db";
import { application, user } from "@/db/schema";
import { sendEmail } from "./email";
import { buildReminderEmail, type ReminderJob } from "./reminder-email";

export const REMINDER_AFTER_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Emails each user about jobs sitting in Applied for 7+ days with no reminder yet,
 * then marks those jobs so they aren't nagged again. Moving a job clears the mark.
 */
export async function sendFollowUpReminders(now = new Date()) {
  const cutoff = new Date(now.getTime() - REMINDER_AFTER_DAYS * DAY_MS);
  const appUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3020";

  const due = await db
    .select({
      id: application.id,
      company: application.company,
      title: application.title,
      statusChangedAt: application.statusChangedAt,
      userId: user.id,
      name: user.name,
      email: user.email,
    })
    .from(application)
    .innerJoin(user, eq(application.userId, user.id))
    .where(
      and(
        eq(application.status, "applied"),
        lte(application.statusChangedAt, cutoff),
        isNull(application.reminderSentAt),
        eq(user.remindersEnabled, true),
      ),
    )
    .orderBy(application.statusChangedAt);

  const byUser = new Map<string, { name: string; email: string; jobs: ReminderJob[] }>();
  for (const row of due) {
    const entry = byUser.get(row.userId) ?? { name: row.name, email: row.email, jobs: [] };
    entry.jobs.push({
      id: row.id,
      company: row.company,
      title: row.title,
      daysWaiting: Math.floor((now.getTime() - row.statusChangedAt.getTime()) / DAY_MS),
    });
    byUser.set(row.userId, entry);
  }

  let emailsSent = 0;
  let failed = 0;
  for (const { name, email, jobs } of byUser.values()) {
    try {
      await sendEmail({ to: email, ...buildReminderEmail({ name, jobs, appUrl }) });
      // Only mark jobs that are still waiting, in case one moved while the email was sending.
      await db
        .update(application)
        .set({ reminderSentAt: now })
        .where(
          and(
            inArray(
              application.id,
              jobs.map((j) => j.id),
            ),
            eq(application.status, "applied"),
          ),
        );
      emailsSent++;
    } catch (err) {
      // One bad address shouldn't stop everyone else's reminders. It's retried tomorrow.
      console.error(`Reminder email to user failed`, err);
      failed++;
    }
  }

  return { jobs: due.length, emailsSent, failed };
}
