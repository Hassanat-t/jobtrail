import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { logOut } from "@/app/(auth)/actions";
import { listApplications } from "@/lib/applications";
import { requireUser } from "@/lib/auth";
import { sourceLabel } from "@/lib/sources";
import { STATUSES } from "@/lib/status";
import { AddJobForm } from "./add-job-form";

export const metadata: Metadata = { title: "Your jobs · JobTrail" };

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b bg-surface">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/dashboard" className="font-serif text-2xl font-medium tracking-tight">
            JobTrail
          </Link>
          <Suspense fallback={<span className="h-5 w-32 animate-pulse rounded bg-surface-muted" />}>
            <UserMenu />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Suspense fallback={<p className="text-muted">Loading your jobs…</p>}>
          <Jobs />
        </Suspense>
      </main>
    </div>
  );
}

async function UserMenu() {
  const user = await requireUser();
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="hidden text-muted sm:inline">{user.name}</span>
      <form action={logOut}>
        <button type="submit" className="rounded-full border px-3 py-1.5 hover:bg-surface-muted">
          Log out
        </button>
      </form>
    </div>
  );
}

async function Jobs() {
  const user = await requireUser();
  const jobs = await listApplications(user.id);
  const counts = Object.fromEntries(STATUSES.map((s) => [s.id, jobs.filter((j) => j.status === s.id).length]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Your jobs</h1>
          <p className="mt-1 text-muted">
            {jobs.length === 0 ? "Nothing tracked yet." : `${jobs.length} tracked`}
          </p>
        </div>
      </div>

      <AddJobForm />

      {jobs.length > 0 && (
        <ul className="flex flex-wrap gap-2 text-sm" aria-label="Jobs by status">
          {STATUSES.map((s) => (
            <li key={s.id} className="flex items-center gap-2 rounded-full border bg-surface px-3 py-1">
              <span className={`size-2 rounded-full ${s.dot}`} aria-hidden />
              {s.label}
              <span className="text-muted">{counts[s.id]}</span>
            </li>
          ))}
        </ul>
      )}

      {jobs.length === 0 ? (
        <div className="rounded-card border border-dashed bg-surface px-6 py-12 text-center">
          <h2 className="text-xl">Add your first job</h2>
          <p className="mx-auto mt-2 max-w-sm text-muted">
            Found a role you like? Add it above and it&apos;ll show up here. The drag-and-drop board comes next.
          </p>
        </div>
      ) : (
        <ul className="divide-y rounded-card border bg-surface">
          {jobs.map((job) => {
            const status = STATUSES.find((s) => s.id === job.status)!;
            return (
              <li key={job.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
                <div className="min-w-0">
                  <p className="font-serif text-lg font-medium">
                    {job.url ? (
                      <a href={job.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                        {job.company}
                      </a>
                    ) : (
                      job.company
                    )}
                  </p>
                  <p className="text-sm text-muted">
                    {job.title}
                    {job.location && ` · ${job.location}`} · {sourceLabel(job.source)}
                  </p>
                </div>
                <span className={`flex items-center gap-2 text-sm font-medium ${status.text}`}>
                  <span className={`size-2 rounded-full ${status.dot}`} aria-hidden />
                  {status.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
