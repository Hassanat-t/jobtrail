import { describe, expect, it } from "vitest";
import { computeStats, weekStart, type StatsApplication, type StatsChange } from "./stats";

const day = (iso: string) => new Date(`${iso}T10:00:00Z`);
const NOW = day("2026-11-07"); // a Saturday

describe("weekStart", () => {
  it("returns the Monday of the week in UTC", () => {
    expect(weekStart(day("2026-11-07")).toISOString()).toBe("2026-11-02T00:00:00.000Z");
    expect(weekStart(day("2026-11-02")).toISOString()).toBe("2026-11-02T00:00:00.000Z");
    expect(weekStart(day("2026-11-01")).toISOString()).toBe("2026-10-26T00:00:00.000Z");
  });
});

describe("computeStats", () => {
  const apps: StatsApplication[] = [
    { id: "saved", source: "linkedin", status: "saved", appliedAt: null },
    { id: "waiting", source: "linkedin", status: "applied", appliedAt: day("2026-11-03") },
    { id: "interview", source: "linkedin", status: "interview", appliedAt: day("2026-10-20") },
    { id: "offer", source: "referral", status: "offer", appliedAt: day("2026-10-01") },
    { id: "rejected", source: "indeed", status: "rejected", appliedAt: day("2026-10-10") },
    { id: "gave-up", source: "indeed", status: "rejected", appliedAt: null },
  ];
  const changes: StatsChange[] = [
    { applicationId: "interview", toStatus: "interview", changedAt: day("2026-10-24") }, // 4 days
    { applicationId: "offer", toStatus: "interview", changedAt: day("2026-10-03") }, // 2 days
    { applicationId: "offer", toStatus: "offer", changedAt: day("2026-10-20") }, // later, not the first reply
    { applicationId: "rejected", toStatus: "rejected", changedAt: day("2026-10-16") }, // 6 days
    { applicationId: "gave-up", toStatus: "rejected", changedAt: day("2026-10-05") }, // never applied: not a reply
  ];
  const stats = computeStats(apps, changes, NOW);

  it("counts jobs per status", () => {
    expect(stats.total).toBe(6);
    expect(stats.byStatus).toEqual({ saved: 1, applied: 1, interview: 1, offer: 1, rejected: 2 });
  });

  it("works out the response rate from jobs that were applied to", () => {
    expect(stats.applied).toBe(4);
    expect(stats.replied).toBe(3);
    expect(stats.responseRate).toBe(0.75);
  });

  it("averages the days to the first reply", () => {
    expect(stats.avgDaysToReply).toBe(4);
  });

  it("breaks replies down by source, most-used first", () => {
    expect(stats.bySource).toEqual([
      { source: "linkedin", applied: 2, replied: 1, rate: 0.5 },
      { source: "referral", applied: 1, replied: 1, rate: 1 },
      { source: "indeed", applied: 1, replied: 1, rate: 1 },
    ]);
  });

  it("counts applications per week for the last 8 weeks", () => {
    expect(stats.weekly).toHaveLength(8);
    expect(stats.weekly.at(-1)).toEqual({ weekStart: new Date("2026-11-02T00:00:00Z"), count: 1 });
    expect(stats.weekly.find((w) => w.weekStart.toISOString().startsWith("2026-10-19"))?.count).toBe(1);
    expect(stats.weekly.reduce((s, w) => s + w.count, 0)).toBe(4);
  });

  it("ignores a status change logged before the applied date", () => {
    const s = computeStats(
      [{ id: "a", source: "other", status: "interview", appliedAt: day("2026-11-01") }],
      [{ applicationId: "a", toStatus: "interview", changedAt: day("2026-10-30") }],
      NOW,
    );
    expect(s.replied).toBe(0);
  });

  it("returns nulls rather than dividing by zero when nothing was applied to", () => {
    const s = computeStats([{ id: "a", source: "other", status: "saved", appliedAt: null }], [], NOW);
    expect(s.responseRate).toBeNull();
    expect(s.avgDaysToReply).toBeNull();
    expect(s.bySource).toEqual([]);
  });
});
