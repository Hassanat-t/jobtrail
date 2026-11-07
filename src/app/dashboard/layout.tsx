import Link from "next/link";
import { Suspense } from "react";
import { logOut } from "@/app/(auth)/actions";
import { requireUser } from "@/lib/auth";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b bg-surface">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:px-6">
          <Link href="/dashboard" className="font-serif text-xl font-medium tracking-tight sm:text-2xl">
            JobTrail
          </Link>
          <Suspense fallback={<span className="h-5 w-32 animate-pulse rounded bg-surface-muted" />}>
            <UserMenu />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

async function UserMenu() {
  const user = await requireUser();
  return (
    <div className="flex items-center gap-1 text-sm sm:gap-2">
      <span className="mr-2 hidden text-muted md:inline">{user.name}</span>
      <Link href="/dashboard/stats" className="rounded-full px-2 py-1.5 hover:bg-surface-muted sm:px-3">
        Stats
      </Link>
      <Link href="/dashboard/settings" className="rounded-full px-2 py-1.5 hover:bg-surface-muted sm:px-3">
        Settings
      </Link>
      <form action={logOut}>
        <button type="submit" className="rounded-full border px-2.5 py-1.5 whitespace-nowrap hover:bg-surface-muted sm:px-3">
          Log out
        </button>
      </form>
    </div>
  );
}
