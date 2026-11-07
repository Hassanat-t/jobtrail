"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { Field, FormError, Input, PrimaryButton } from "@/components/ui";
import { logIn, signUp, type AuthFormState } from "./actions";

export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const isSignUp = mode === "signup";
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    isSignUp ? signUp : logIn,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <FormError message={state.error} />
      {isSignUp && (
        <Field label="Name">
          <Input name="name" autoComplete="name" defaultValue={state.fields?.name} required />
        </Field>
      )}
      <Field label="Email">
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          defaultValue={state.fields?.email}
          required
        />
      </Field>
      <PasswordField isSignUp={isSignUp} />
      <PrimaryButton type="submit" disabled={pending} className="w-full">
        {pending ? (isSignUp ? "Creating account…" : "Logging in…") : isSignUp ? "Create account" : "Log in"}
      </PrimaryButton>
      <p className="text-center text-sm text-muted">
        {isSignUp ? "Already have an account? " : "New to JobTrail? "}
        <Link href={isSignUp ? "/login" : "/signup"} className="font-medium text-primary hover:underline">
          {isSignUp ? "Log in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}

/** Password input with a Show/Hide button. Not built on Field so the button isn't part of the input's label. */
function PasswordField({ isSignUp }: { isSignUp: boolean }) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        Password
      </label>
      <div className="relative">
        <Input
          id={id}
          name="password"
          type={visible ? "text" : "password"}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          minLength={isSignUp ? 8 : undefined}
          aria-describedby={isSignUp ? hintId : undefined}
          className="pr-20"
          required
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-controls={id}
          aria-pressed={visible}
          aria-label="Show password"
          className="absolute inset-y-1 right-1 rounded-input px-3 text-sm font-medium text-muted hover:bg-surface-muted hover:text-foreground"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {isSignUp && (
        <span id={hintId} className="block text-xs text-muted">
          At least 8 characters
        </span>
      )}
    </div>
  );
}
