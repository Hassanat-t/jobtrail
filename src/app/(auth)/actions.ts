"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";

export type AuthFormState = { error?: string; fields?: Record<string, string> };

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters for your password"),
});

const logInSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = signUpSchema.safeParse(raw);
  const fields = { name: raw.name ?? "", email: raw.email ?? "" };
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields };

  try {
    await auth.api.signUpEmail({ body: parsed.data, headers: await headers() });
  } catch (err) {
    if (err instanceof APIError) {
      const taken = String(err.body?.code ?? "").startsWith("USER_ALREADY_EXISTS");
      return {
        error: taken ? "There's already an account with that email. Log in instead." : err.message,
        fields,
      };
    }
    throw err;
  }
  redirect("/dashboard");
}

export async function logIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = logInSchema.safeParse(raw);
  const fields = { email: raw.email ?? "" };
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields };

  try {
    await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
  } catch (err) {
    if (err instanceof APIError) {
      return { error: "That email and password don't match. Try again.", fields };
    }
    throw err;
  }
  redirect("/dashboard");
}

export async function logOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
