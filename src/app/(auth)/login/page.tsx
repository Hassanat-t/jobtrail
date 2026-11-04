import type { Metadata } from "next";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Log in · JobTrail" };

export default function LogInPage() {
  return (
    <>
      <h1 className="text-2xl">Welcome back</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Log in to see your board.</p>
      <AuthForm mode="login" />
    </>
  );
}
