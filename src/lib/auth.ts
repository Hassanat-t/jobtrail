import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      remindersEnabled: { type: "boolean", defaultValue: true, input: false },
    },
  },
  // Must stay last: lets server actions set the session cookie.
  plugins: [nextCookies()],
});

export type CurrentUser = { id: string; name: string; email: string };

/**
 * Returns the logged-in user, or null. Reads the request, so call it inside a <Suspense> boundary.
 * Wrapped in cache() so several components on one page share a single session lookup.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, name, email } = session.user;
  return { id, name, email };
});

/** Like getCurrentUser, but sends logged-out visitors to /login. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
