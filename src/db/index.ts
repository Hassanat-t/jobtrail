import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env.");
}

export const db = drizzle(process.env.DATABASE_URL, { schema, casing: "snake_case" });
