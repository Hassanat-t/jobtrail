"use client";

import { useActionState, useState } from "react";
import { FormError, PrimaryButton } from "@/components/ui";
import { addJob, type JobFormState } from "./actions";
import { JobFields } from "./job-fields";

export function AddJobForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<JobFormState, FormData>(async (prev, formData) => {
    const result = await addJob(prev, formData);
    // Closing unmounts the form, so it opens empty next time.
    if (result.ok) setOpen(false);
    return result;
  }, {});

  if (!open) {
    return <PrimaryButton onClick={() => setOpen(true)}>+ Add job</PrimaryButton>;
  }

  return (
    <form action={action} className="space-y-4 rounded-card border bg-surface p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl">Add a job</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted hover:text-foreground">
          Cancel
        </button>
      </div>
      <FormError message={state.error} />
      <JobFields autoFocus />
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save job"}
      </PrimaryButton>
    </form>
  );
}
