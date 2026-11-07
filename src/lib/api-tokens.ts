import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { apiToken, user } from "@/db/schema";
import type { CurrentUser } from "./auth";

// Personal API tokens for the Chrome extension.
// The raw token is shown once when created; only its SHA-256 hash is stored.

const PREFIX = "jt_";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export function listApiTokens(userId: string) {
  return db
    .select({
      id: apiToken.id,
      name: apiToken.name,
      lastUsedAt: apiToken.lastUsedAt,
      createdAt: apiToken.createdAt,
    })
    .from(apiToken)
    .where(eq(apiToken.userId, userId))
    .orderBy(desc(apiToken.createdAt));
}

/** Creates a token and returns the raw value. It can't be recovered later. */
export async function createApiToken(userId: string, name: string): Promise<string> {
  const token = PREFIX + randomBytes(24).toString("base64url");
  await db.insert(apiToken).values({ userId, name, tokenHash: hashToken(token) });
  return token;
}

export async function revokeApiToken(userId: string, id: string) {
  await db.delete(apiToken).where(and(eq(apiToken.id, id), eq(apiToken.userId, userId)));
}

/** Reads `Authorization: Bearer jt_…` and returns the token's owner, or null. */
export async function userFromRequest(request: Request): Promise<CurrentUser | null> {
  const match = request.headers.get("authorization")?.match(/^Bearer\s+(jt_[\w-]+)$/i);
  if (!match) return null;

  const tokenHash = hashToken(match[1]);
  const [row] = await db
    .select({ tokenId: apiToken.id, id: user.id, name: user.name, email: user.email })
    .from(apiToken)
    .innerJoin(user, eq(apiToken.userId, user.id))
    .where(eq(apiToken.tokenHash, tokenHash));
  if (!row) return null;

  await db.update(apiToken).set({ lastUsedAt: new Date() }).where(eq(apiToken.id, row.tokenId));
  return { id: row.id, name: row.name, email: row.email };
}
