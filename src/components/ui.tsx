// Small shared form pieces, styled with the Warm paper tokens.
import type { ComponentProps } from "react";

export const inputClass =
  "w-full rounded-input border bg-surface px-3 py-2.5 text-base placeholder:text-muted/70 focus:border-primary focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-primary/20";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function PrimaryButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60 ${className ?? ""}`}
    />
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-input bg-primary-soft px-3 py-2 text-sm text-primary-soft-foreground">
      {message}
    </p>
  );
}
