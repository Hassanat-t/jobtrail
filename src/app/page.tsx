import Link from "next/link";
import { STATUSES } from "@/lib/status";

const previewJobs: Record<string, { company: string; title: string; days: number }[]> = {
  saved: [{ company: "Kuda", title: "Frontend developer", days: 1 }],
  applied: [
    { company: "Paystack", title: "Frontend developer", days: 4 },
    { company: "Andela", title: "React engineer", days: 9 },
  ],
  interview: [{ company: "Flutterwave", title: "UI engineer", days: 2 }],
  offer: [{ company: "Moniepoint", title: "Software engineer", days: 1 }],
  rejected: [{ company: "Piggyvest", title: "Web developer", days: 12 }],
};

const steps = [
  {
    title: "Save in one click",
    body: "Spot a job on LinkedIn or Indeed, click the extension, and it's on your board.",
  },
  {
    title: "Move it along",
    body: "Drag each card from Applied to Interview to Offer as replies come in.",
  },
  {
    title: "Never go cold",
    body: "Get a nudge when it's been a week with no reply, and see which sources work.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="font-serif text-2xl font-medium tracking-tight">
          JobTrail
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/login" className="rounded-full px-4 py-2 text-muted hover:text-foreground">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
        <section className="py-14 text-center sm:py-20">
          <p className="mx-auto mb-5 w-fit rounded-full bg-primary-soft px-3 py-1 text-sm text-primary-soft-foreground">
            Your job search, kept tidy
          </p>
          <h1 className="mx-auto max-w-2xl text-4xl leading-tight sm:text-6xl">
            Every application, from saved to signed.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
            Save jobs in one click, track where each one stands, and get reminded to follow up
            before an opportunity goes cold.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="w-full rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary-hover sm:w-auto"
            >
              Start tracking for free
            </Link>
            <Link
              href="#how-it-works"
              className="w-full rounded-full border px-6 py-3 font-medium hover:bg-surface-muted sm:w-auto"
            >
              See how it works
            </Link>
          </div>
        </section>

        <section aria-label="Board preview" className="rounded-card border bg-surface p-3 sm:p-4">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {STATUSES.map((status) => {
              const jobs = previewJobs[status.id];
              return (
                <div
                  key={status.id}
                  className="min-w-[200px] flex-1 rounded-card bg-surface-muted p-3"
                >
                  <div className="mb-3 flex items-center gap-2 text-sm">
                    <span className={`size-2 rounded-full ${status.dot}`} aria-hidden />
                    <span className="font-medium">{status.label}</span>
                    <span className="text-muted">{jobs.length}</span>
                  </div>
                  <ul className="space-y-2">
                    {jobs.map((job) => (
                      <li key={job.company} className="rounded-input border bg-surface p-3">
                        <p className="font-serif text-base font-medium">{job.company}</p>
                        <p className="text-sm text-muted">{job.title}</p>
                        <p className="mt-2 text-xs text-muted">
                          {job.days} {job.days === 1 ? "day" : "days"} here
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section id="how-it-works" className="py-16 sm:py-24">
          <h2 className="text-center text-3xl sm:text-4xl">How it works</h2>
          <ol className="mt-10 grid gap-4 sm:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="rounded-card border bg-surface p-6">
                <span className="font-serif text-3xl text-primary">{i + 1}</span>
                <h3 className="mt-3 text-xl">{step.title}</h3>
                <p className="mt-2 text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted">
        Built by Anidu Hassanat
      </footer>
    </div>
  );
}
