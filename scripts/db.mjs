// Local Postgres for development (no Docker needed). Run with `pnpm db:start` and leave it running.
import EmbeddedPostgres from "embedded-postgres";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.resolve(import.meta.dirname, "../.pgdata");
const fresh = !fs.existsSync(dataDir);

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "jobtrail",
  password: "jobtrail",
  port: 5434,
  persistent: true,
  // Without this, Windows creates the cluster as WIN1252, which can't store characters like ₦.
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

if (fresh) await pg.initialise();
await pg.start();
if (fresh) await pg.createDatabase("jobtrail");
console.log("postgres ready on localhost:5434 (db jobtrail)");

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1 << 30);
