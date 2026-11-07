"use client";

import { useOptimistic, useState, useTransition } from "react";
import { setReminders } from "./actions";

export function RemindersSwitch({ enabled }: { enabled: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(enabled);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    const next = !optimistic;
    setError(null);
    startTransition(async () => {
      setOptimistic(next);
      try {
        await setReminders(next);
      } catch {
        setError("That didn't save. Try again.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p id="reminders-label" className="font-medium">
            Follow-up reminders
          </p>
          <p id="reminders-hint" className="text-sm text-muted">
            One email a day at most, when a job has sat in Applied for 7 days with no change.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={optimistic}
          aria-labelledby="reminders-label"
          aria-describedby="reminders-hint"
          onClick={toggle}
          className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors ${
            optimistic ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            aria-hidden
            className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-surface shadow transition-transform ${
              optimistic ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-primary-soft-foreground">
          {error}
        </p>
      )}
    </div>
  );
}
