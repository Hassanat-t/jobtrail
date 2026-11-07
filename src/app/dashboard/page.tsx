import type { Metadata } from "next";
import { Suspense } from "react";
import { listApplications } from "@/lib/applications";
import { requireUser } from "@/lib/auth";
import { sourceLabel } from "@/lib/sources";
import { AddJobForm } from "./add-job-form";
import { Board, type BoardJob } from "./board";

export const metadata: Metadata = { title: "Your jobs · JobTrail" };

const DAY_MS = 24 * 60 * 60 * 1000;

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="text-muted">Loading your jobs…</p>}>
      <Jobs />
    </Suspense>
  );
}

/** Loads the user's jobs in the shape the board needs, with days spent in the current stage. */
async function loadBoardJobs(userId: string): Promise<BoardJob[]> {
  const rows = await listApplications(userId);
  const now = Date.now();
  return rows.map((row) => ({
    id: row.id,
    company: row.company,
    title: row.title,
    meta: [row.location, sourceLabel(row.source)].filter(Boolean).join(" · "),
    status: row.status,
    daysInStage: Math.floor((now - row.statusChangedAt.getTime()) / DAY_MS),
  }));
}

async function Jobs() {
  const user = await requireUser();
  const jobs = await loadBoardJobs(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Your jobs</h1>
        <p className="mt-1 text-muted">{jobs.length === 0 ? "Nothing tracked yet." : `${jobs.length} tracked`}</p>
      </div>

      <AddJobForm />

      {jobs.length === 0 ? (
        <div className="rounded-card border border-dashed bg-surface px-6 py-12 text-center">
          <h2 className="text-xl">Add your first job</h2>
          <p className="mx-auto mt-2 max-w-sm text-muted">
            Found a role you like? Add it above and it&apos;ll appear on your board, ready to move along as you hear
            back.
          </p>
        </div>
      ) : (
        <Board jobs={jobs} />
      )}
    </div>
  );
}
