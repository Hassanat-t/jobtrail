"use client";

import { useActionState, useState } from "react";
import { FormError, PrimaryButton } from "@/components/ui";
import { deleteJob, updateJob, type JobFormState } from "../../actions";
import { JobFields, type JobDefaults } from "../../job-fields";

export function EditJobForm({ id, defaults }: { id: string; defaults: JobDefaults }) {
  const [state, action, pending] = useActionState<JobFormState, FormData>(updateJob.bind(null, id), {});

  return (
    <form action={action} className="space-y-4">
      <FormError message={state.error} />
      <JobFields defaults={defaults} />
      <div className="flex items-center gap-3">
        <PrimaryButton type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </PrimaryButton>
        {state.ok && !pending && (
          <span role="status" className="text-sm text-status-offer">
            Saved
          </span>
        )}
      </div>
    </form>
  );
}

export function DeleteJobButton({ id, company }: { id: string; company: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-full border border-status-rejected/40 px-4 py-2 text-sm font-medium text-status-rejected hover:bg-status-rejected/10"
      >
        Delete job
      </button>
    );
  }

  return (
    <form
      action={async () => {
        setPending(true);
        await deleteJob(id);
      }}
      className="space-y-3"
    >
      <p className="text-sm">Delete {company}? This can&apos;t be undone.</p>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-status-rejected px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border px-4 py-2 text-sm hover:bg-surface-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
