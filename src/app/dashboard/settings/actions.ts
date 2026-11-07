"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { createApiToken, revokeApiToken } from "@/lib/api-tokens";
import { requireUser } from "@/lib/auth";
import { idSchema } from "@/lib/job-schema";

export type TokenFormState = { error?: string; token?: string };

const nameSchema = z.string().trim().min(1, "Give the token a name").max(60, "Keep the name under 60 characters");

export async function createToken(_prev: TokenFormState, formData: FormData): Promise<TokenFormState> {
  const user = await requireUser();
  const name = nameSchema.safeParse(formData.get("name"));
  if (!name.success) return { error: name.error.issues[0].message };

  const token = await createApiToken(user.id, name.data);
  refresh();
  return { token };
}

export async function revokeToken(id: string) {
  const user = await requireUser();
  if (idSchema.safeParse(id).success) await revokeApiToken(user.id, id);
  refresh();
}
