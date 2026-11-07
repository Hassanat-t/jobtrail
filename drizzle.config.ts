import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// Locally the URL comes from .env; in CI and on Vercel it's set in the environment.
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
