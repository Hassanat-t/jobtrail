import Link from "next/link";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-10 sm:py-16">
      <Link href="/" className="mb-8 font-serif text-3xl font-medium tracking-tight">
        JobTrail
      </Link>
      <div className="w-full max-w-sm rounded-card border bg-surface p-6 sm:p-8">{children}</div>
    </div>
  );
}
