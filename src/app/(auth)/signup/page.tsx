import type { Metadata } from "next";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Sign up · JobTrail" };

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-2xl">Create your account</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Start tracking your applications in one place.</p>
      <AuthForm mode="signup" />
    </>
  );
}
