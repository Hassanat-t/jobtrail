import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getStatsData } from "@/lib/applications";
import { requireUser } from "@/lib/auth";
import { sourceLabel } from "@/lib/sources";
import { computeStats, type Stats } from "@/lib/stats";
import { STATUSES } from "@/lib/status";

export const metadata: Metadata = { title: "Stats · JobTrail" };

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Stats</h1>
        <p className="mt-1 text-muted">How your search is going, and where replies come from.</p>
      </div>
      <Suspense fallback={<p className="text-muted">Working out your stats…</p>}>
        <StatsContent />
      </Suspense>
    </div>
  );
}

/** Kept outside the component: it reads the clock. */
async function loadStats(userId: string) {
  const { applications, changes } = await getStatsData(userId);
  return computeStats(applications, changes, new Date());
}

/** Rounds to whole days, with "under a day" for same-day replies. */
const daysLabel = (days: number) => {
  const n = Math.round(days);
  return n === 0 ? "< 1 day" : `${n} ${n === 1 ? "day" : "days"}`;
};
const percent = (r: number | null) => (r === null ? "–" : `${Math.round(r * 100)}%`);
const weekLabel = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

async function StatsContent() {
  const user = await requireUser();
  const stats = await loadStats(user.id);

  if (stats.total === 0) {
    return (
      <div className="rounded-card border border-dashed bg-surface px-6 py-12 text-center">
        <h2 className="text-xl">No stats yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          Add jobs to your board and move them along as you hear back. Your numbers will show up here.
        </p>
        <Link href="/dashboard" className="mt-4 inline-block font-medium text-primary hover:underline">
          Go to your board
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Jobs tracked" value={String(stats.total)} />
        <Tile label="Applied to" value={String(stats.applied)} hint="Jobs that reached Applied" />
        <Tile
          label="Response rate"
          value={percent(stats.responseRate)}
          hint={stats.applied ? `${stats.replied} of ${stats.applied} replied` : "Apply to a job to see this"}
        />
        <Tile
          label="Average reply time"
          value={stats.avgDaysToReply === null ? "–" : daysLabel(stats.avgDaysToReply)}
          hint={stats.avgDaysToReply === null ? "No replies yet" : "From applying to first reply"}
        />
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Where your jobs are" subtitle="Jobs in each column right now">
          <ByStatus stats={stats} />
        </Card>
        <Card title="Applications per week" subtitle="Jobs moved to Applied, last 8 weeks">
          <Weekly stats={stats} />
        </Card>
      </div>

      <Card title="Replies by source" subtitle="Share of applications that got a reply, by where you found the job">
        <BySource stats={stats} />
      </Card>

      <p className="text-xs text-muted">
        A reply is any move to Interview, Offer or Rejected after applying. Keep your board up to date and these
        numbers stay right.
      </p>
    </div>
  );
}

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-card border bg-surface p-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 font-serif text-2xl whitespace-nowrap sm:text-3xl">{value}</dd>
      {hint && <dd className="mt-1 text-xs text-muted">{hint}</dd>}
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border bg-surface p-5">
      <h2 className="text-xl">{title}</h2>
      <p className="mb-4 text-sm text-muted">{subtitle}</p>
      {children}
    </section>
  );
}

/** One labelled row per status. The label carries identity; the colour matches the board. */
function ByStatus({ stats }: { stats: Stats }) {
  const max = Math.max(1, ...Object.values(stats.byStatus));
  return (
    <ul className="space-y-3">
      {STATUSES.map((s) => {
        const count = stats.byStatus[s.id];
        return (
          <li key={s.id} className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-3 text-sm">
            <span>{s.label}</span>
            <span className="h-4" aria-hidden>
              {count > 0 && (
                <span
                  className={`block h-full rounded-r-[4px] ${s.dot}`}
                  style={{ width: `${(count / max) * 100}%` }}
                />
              )}
            </span>
            <span className="text-right tabular-nums">{count}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Keeps the tooltip on screen: the first columns open rightwards, the last ones leftwards. */
const tooltipSide = (i: number, n: number) =>
  i < 2 ? "left-0" : i >= n - 2 ? "right-0" : "left-1/2 -translate-x-1/2";

/** Column chart with a tooltip on hover or keyboard focus, plus a table for screen readers. */
function Weekly({ stats }: { stats: Stats }) {
  const max = Math.max(1, ...stats.weekly.map((w) => w.count));
  const total = stats.weekly.reduce((s, w) => s + w.count, 0);
  const describe = (w: Stats["weekly"][number]) =>
    `Week of ${weekLabel(w.weekStart)}: ${w.count} ${w.count === 1 ? "application" : "applications"}`;

  return (
    <div>
      <div className="flex h-40 items-end gap-1 border-b" aria-hidden>
        {stats.weekly.map((w, i) => (
          <div
            key={w.weekStart.toISOString()}
            className="group relative flex h-full flex-1 items-end justify-center rounded-t-[4px] hover:bg-surface-muted"
          >
            {w.count > 0 && (
              <span
                className="block w-full max-w-6 rounded-t-[4px] bg-status-applied"
                style={{ height: `${(w.count / max) * 100}%` }}
              />
            )}
            <span
              className={`pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-input ${tooltipSide(i, stats.weekly.length)} border bg-surface px-2 py-1 text-xs whitespace-nowrap shadow-sm group-hover:block`}
            >
              {describe(w)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1 text-[11px] text-muted" aria-hidden>
        {stats.weekly.map((w, i) => (
          <span key={w.weekStart.toISOString()} className="flex-1 text-center whitespace-nowrap">
            {i % 2 === 1 || i === stats.weekly.length - 1 ? weekLabel(w.weekStart) : ""}
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted">
        {total === 0 ? "No applications in the last 8 weeks." : `${total} in the last 8 weeks.`}
      </p>
      <div className="sr-only">
      <table>
        <caption>Applications per week, last 8 weeks</caption>
        <thead>
          <tr>
            <th scope="col">Week starting</th>
            <th scope="col">Applications</th>
          </tr>
        </thead>
        <tbody>
          {stats.weekly.map((w) => (
            <tr key={w.weekStart.toISOString()}>
              <td>{weekLabel(w.weekStart)}</td>
              <td>{w.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function BySource({ stats }: { stats: Stats }) {
  if (stats.bySource.length === 0) {
    return <p className="text-sm text-muted">Once you apply to jobs, you&apos;ll see which sources get replies.</p>;
  }
  return (
    <ul className="space-y-3">
      {stats.bySource.map((s) => (
        <li
          key={s.source}
          className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 text-sm sm:grid-cols-[7rem_1fr_auto]"
        >
          <span>{sourceLabel(s.source)}</span>
          <span className="col-span-2 row-start-2 h-4 rounded-r-[4px] bg-surface-muted sm:col-span-1 sm:col-start-2 sm:row-start-1" aria-hidden>
            {s.rate > 0 && (
              <span className="block h-full rounded-r-[4px] bg-status-applied" style={{ width: `${s.rate * 100}%` }} />
            )}
          </span>
          <span className="text-right whitespace-nowrap tabular-nums sm:col-start-3 sm:row-start-1">
            {percent(s.rate)} <span className="text-muted">· {s.replied} of {s.applied}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
