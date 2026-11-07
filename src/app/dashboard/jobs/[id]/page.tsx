import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { getApplication, getStatusHistory } from "@/lib/applications";
import { requireUser } from "@/lib/auth";
import { STATUSES } from "@/lib/status";
import { DeleteJobButton, EditJobForm } from "./job-forms";

export const metadata: Metadata = { title: "Job · JobTrail" };

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function JobPage({ params }: PageProps<"/dashboard/jobs/[id]">) {
  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">
        ← Back to board
      </Link>
      <Suspense fallback={<p className="text-muted">Loading job…</p>}>
        <JobDetail params={params} />
      </Suspense>
    </div>
  );
}

async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, requireUser()]);
  if (!z.uuid().safeParse(id).success) notFound();

  const [job, history] = await Promise.all([getApplication(user.id, id), getStatusHistory(user.id, id)]);
  if (!job) notFound();

  const status = STATUSES.find((s) => s.id === job.status)!;
  const statusInfo = (id: string | null) => STATUSES.find((s) => s.id === id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl">{job.company}</h1>
          <p className="mt-1 text-lg text-muted">{job.title}</p>
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
            >
              View job post ↗
            </a>
          )}
        </div>
        <span className="flex items-center gap-2 rounded-full border bg-surface px-3 py-1 text-sm font-medium">
          <span className={`size-2 rounded-full ${status.dot}`} aria-hidden />
          {status.label}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-labelledby="edit-heading" className="rounded-card border bg-surface p-5 sm:p-6">
          <h2 id="edit-heading" className="mb-4 text-xl">
            Details
          </h2>
          <EditJobForm id={job.id} defaults={job} />
        </section>

        <aside className="space-y-6">
          <section aria-labelledby="history-heading" className="rounded-card border bg-surface p-5">
            <h2 id="history-heading" className="mb-4 text-xl">
              History
            </h2>
            <ol className="relative space-y-4 border-l pl-5">
              {history.map((change) => {
                const to = statusInfo(change.toStatus)!;
                const from = statusInfo(change.fromStatus);
                return (
                  <li key={change.id} className="relative">
                    <span
                      className={`absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full ring-4 ring-surface ${to.dot}`}
                      aria-hidden
                    />
                    <p className="text-sm font-medium">
                      {from ? (
                        <>
                          {from.label} → <span className={to.text}>{to.label}</span>
                        </>
                      ) : (
                        <>
                          Added as <span className={to.text}>{to.label}</span>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-muted">{dateFormat.format(change.changedAt)}</p>
                  </li>
                );
              })}
            </ol>
          </section>

          <section aria-labelledby="danger-heading" className="rounded-card border bg-surface p-5">
            <h2 id="danger-heading" className="text-xl">
              Delete
            </h2>
            <p className="mb-4 mt-1 text-sm text-muted">Removes this job and its history for good.</p>
            <DeleteJobButton id={job.id} company={job.company} />
          </section>
        </aside>
      </div>
    </div>
  );
}
