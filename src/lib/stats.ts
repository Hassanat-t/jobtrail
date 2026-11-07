// Stats for the stats page. Pure functions over plain rows, so they're easy to test.
import type { Source } from "./sources";
import { STATUSES, type Status } from "./status";

export type StatsApplication = { id: string; source: Source; status: Status; appliedAt: Date | null };
export type StatsChange = { applicationId: string; toStatus: Status; changedAt: Date };

/** Moving to any of these after applying means the company replied (a rejection is a reply too). */
const REPLY_STATUSES: Status[] = ["interview", "offer", "rejected"];
const DAY_MS = 24 * 60 * 60 * 1000;
export const WEEKS_SHOWN = 8;

/** Monday 00:00 UTC of the week containing `d`. */
export function weekStart(d: Date): Date {
  const day = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const sinceMonday = (day.getUTCDay() + 6) % 7;
  return new Date(day.getTime() - sinceMonday * DAY_MS);
}

export function computeStats(applications: StatsApplication[], changes: StatsChange[], now: Date) {
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s.id, 0])) as Record<Status, number>;
  for (const a of applications) byStatus[a.status]++;

  // First reply per application: the earliest move to a reply status on or after the applied date.
  const appliedAt = new Map(applications.filter((a) => a.appliedAt).map((a) => [a.id, a.appliedAt!]));
  const firstReply = new Map<string, Date>();
  for (const c of changes) {
    const applied = appliedAt.get(c.applicationId);
    if (!applied || !REPLY_STATUSES.includes(c.toStatus) || c.changedAt < applied) continue;
    const seen = firstReply.get(c.applicationId);
    if (!seen || c.changedAt < seen) firstReply.set(c.applicationId, c.changedAt);
  }

  const applied = applications.filter((a) => a.appliedAt);
  const replied = applied.filter((a) => firstReply.has(a.id));
  const rate = (n: number, of: number) => (of === 0 ? null : n / of);

  const replyDays = replied.map((a) => (firstReply.get(a.id)!.getTime() - a.appliedAt!.getTime()) / DAY_MS);
  const avgDaysToReply = replyDays.length ? replyDays.reduce((s, d) => s + d, 0) / replyDays.length : null;

  const sources = new Map<Source, { applied: number; replied: number }>();
  for (const a of applied) {
    const entry = sources.get(a.source) ?? { applied: 0, replied: 0 };
    entry.applied++;
    if (firstReply.has(a.id)) entry.replied++;
    sources.set(a.source, entry);
  }
  const bySource = [...sources.entries()]
    .map(([source, s]) => ({ source, ...s, rate: rate(s.replied, s.applied)! }))
    .sort((a, b) => b.applied - a.applied || b.rate - a.rate);

  const thisWeek = weekStart(now).getTime();
  const weekly = Array.from({ length: WEEKS_SHOWN }, (_, i) => ({
    weekStart: new Date(thisWeek - (WEEKS_SHOWN - 1 - i) * 7 * DAY_MS),
    count: 0,
  }));
  for (const a of applied) {
    const index = WEEKS_SHOWN - 1 - Math.round((thisWeek - weekStart(a.appliedAt!).getTime()) / (7 * DAY_MS));
    if (index >= 0 && index < WEEKS_SHOWN) weekly[index].count++;
  }

  return {
    total: applications.length,
    byStatus,
    applied: applied.length,
    replied: replied.length,
    responseRate: rate(replied.length, applied.length),
    avgDaysToReply,
    bySource,
    weekly,
  };
}

export type Stats = ReturnType<typeof computeStats>;
