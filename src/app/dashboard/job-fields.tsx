// Shared fields for the add and edit job forms.
import { Field, Input, inputClass } from "@/components/ui";
import { SOURCES } from "@/lib/sources";
import { STATUSES } from "@/lib/status";

export type JobDefaults = {
  company?: string;
  title?: string;
  url?: string | null;
  location?: string | null;
  salary?: string | null;
  source?: string;
  status?: string;
  notes?: string | null;
};

export function JobFields({ defaults = {}, autoFocus }: { defaults?: JobDefaults; autoFocus?: boolean }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company">
          <Input name="company" placeholder="Paystack" defaultValue={defaults.company} required autoFocus={autoFocus} />
        </Field>
        <Field label="Job title">
          <Input name="title" placeholder="Frontend developer" defaultValue={defaults.title} required />
        </Field>
        <Field label="Link to the job post">
          <Input name="url" type="url" placeholder="https://…" defaultValue={defaults.url ?? ""} />
        </Field>
        <Field label="Location">
          <Input name="location" placeholder="Lagos, or Remote" defaultValue={defaults.location ?? ""} />
        </Field>
        <Field label="Where did you find it?">
          <select name="source" defaultValue={defaults.source ?? "linkedin"} className={inputClass}>
            {SOURCES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={defaults.status ?? "saved"} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Salary" hint="Optional, in any format">
          <Input name="salary" placeholder="₦450k/month" defaultValue={defaults.salary ?? ""} />
        </Field>
      </div>
      <Field label="Notes">
        <textarea
          name="notes"
          rows={4}
          placeholder="Recruiter's name, interview prep, anything to remember"
          defaultValue={defaults.notes ?? ""}
          className={inputClass}
        />
      </Field>
    </>
  );
}
