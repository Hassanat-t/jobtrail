"use client";

import { useActionState, useState } from "react";
import { Field, FormError, Input, PrimaryButton, inputClass } from "@/components/ui";
import { SOURCES } from "@/lib/sources";
import { STATUSES } from "@/lib/status";
import { addJob, type AddJobState } from "./actions";

export function AddJobForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<AddJobState, FormData>(async (prev, formData) => {
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company">
          <Input name="company" placeholder="Paystack" required autoFocus />
        </Field>
        <Field label="Job title">
          <Input name="title" placeholder="Frontend developer" required />
        </Field>
        <Field label="Link to the job post">
          <Input name="url" type="url" placeholder="https://…" />
        </Field>
        <Field label="Location">
          <Input name="location" placeholder="Lagos, or Remote" />
        </Field>
        <Field label="Where did you find it?">
          <select name="source" defaultValue="linkedin" className={inputClass}>
            {SOURCES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue="saved" className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Notes">
        <textarea name="notes" rows={3} placeholder="Recruiter's name, salary range, anything to remember" className={inputClass} />
      </Field>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save job"}
      </PrimaryButton>
    </form>
  );
}
