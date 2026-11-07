"use client";

import { useActionState, useState } from "react";
import { Field, FormError, Input, PrimaryButton, inputClass } from "@/components/ui";
import { createToken, type TokenFormState } from "./actions";

export function CreateTokenForm() {
  const [state, action, pending] = useActionState<TokenFormState, FormData>(createToken, {});

  return (
    <div className="space-y-4">
      <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Field label="Token name" hint="So you can tell your tokens apart, e.g. the browser or laptop it's on.">
            <Input name="name" defaultValue="Chrome extension" required maxLength={60} />
          </Field>
        </div>
        <PrimaryButton type="submit" disabled={pending} className="sm:mb-6">
          {pending ? "Creating…" : "Create token"}
        </PrimaryButton>
      </form>
      <FormError message={state.error} />
      {state.token && <NewToken token={state.token} />}
    </div>
  );
}

function NewToken({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-2 rounded-card border border-status-offer/40 bg-surface-muted p-4">
      <p className="text-sm font-medium">Copy your new token now. You won&apos;t be able to see it again.</p>
      <div className="flex gap-2">
        <input
          readOnly
          value={token}
          aria-label="New API token"
          onFocus={(e) => e.currentTarget.select()}
          className={`${inputClass} font-mono text-sm`}
        />
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-full border bg-surface px-4 text-sm font-medium hover:bg-surface-muted"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-xs text-muted">Paste it into the JobTrail extension&apos;s setup screen.</p>
    </div>
  );
}
