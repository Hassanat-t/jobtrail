import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { listApiTokens } from "@/lib/api-tokens";
import { requireUser } from "@/lib/auth";
import { revokeToken } from "./actions";
import { RemindersSwitch } from "./reminders-switch";
import { CreateTokenForm } from "./token-form";

export const metadata: Metadata = { title: "Settings · JobTrail" };

const formatDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl">Settings</h1>
      </div>

      <section className="rounded-card border bg-surface p-5 sm:p-6">
        <h2 className="mb-4 text-xl">Email</h2>
        <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
          <Reminders />
        </Suspense>
      </section>

      <section className="space-y-5 rounded-card border bg-surface p-5 sm:p-6">
        <div>
          <h2 className="text-xl">Chrome extension</h2>
          <p className="mt-1 text-sm text-muted">
            The extension saves jobs straight from LinkedIn, Indeed and company career pages. It signs in with a
            personal token instead of your password. Create one here, then paste it into the extension.
          </p>
        </div>
        <CreateTokenForm />
        <Suspense fallback={<p className="text-sm text-muted">Loading tokens…</p>}>
          <TokenList />
        </Suspense>
      </section>
    </div>
  );
}

async function Reminders() {
  const user = await requireUser();
  const [row] = await db
    .select({ remindersEnabled: userTable.remindersEnabled })
    .from(userTable)
    .where(eq(userTable.id, user.id));
  return <RemindersSwitch enabled={row?.remindersEnabled ?? true} />;
}

async function TokenList() {
  const user = await requireUser();
  const tokens = await listApiTokens(user.id);
  if (tokens.length === 0) return <p className="text-sm text-muted">You don&apos;t have any tokens yet.</p>;

  return (
    <div>
      <h3 className="mb-2 font-sans text-sm font-medium tracking-normal">Your tokens</h3>
      <ul className="divide-y rounded-input border">
        {tokens.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{t.name}</p>
              <p className="text-xs text-muted">
                Created {formatDate(t.createdAt)} ·{" "}
                {t.lastUsedAt ? `last used ${formatDate(t.lastUsedAt)}` : "never used"}
              </p>
            </div>
            <form action={revokeToken.bind(null, t.id)}>
              <button
                type="submit"
                aria-label={`Revoke ${t.name}`}
                className="rounded-full border px-3 py-1 text-sm text-status-rejected hover:bg-surface-muted"
              >
                Revoke
              </button>
            </form>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted">Revoking a token signs that extension out straight away.</p>
    </div>
  );
}
