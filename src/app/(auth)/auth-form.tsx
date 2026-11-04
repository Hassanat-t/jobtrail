"use client";

import Link from "next/link";
import { useActionState } from "react";
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
      <Field label="Password" hint={isSignUp ? "At least 8 characters" : undefined}>
        <Input
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          minLength={isSignUp ? 8 : undefined}
          required
        />
      </Field>
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
