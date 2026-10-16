// Applies SQL migrations in db/migrations. Runs on every Vercel build.
import "dotenv/config";
import { configuredDatabaseUrl } from "../db/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

async function main() {
  const direct = process.env.DIRECT_URL?.trim();
  const url = direct && !/USER:PASSWORD@HOST/i.test(direct) ? direct : configuredDatabaseUrl();
  if (!url) {
    if (process.env.VERCEL) throw new Error("DATABASE_URL is not set in Vercel → Settings → Environment Variables");
    console.log("No DATABASE_URL set — the built-in local database sets itself up when the app starts.");
    return;
  }
  const pool = new Pool({
    connectionString: url,
    ssl: /sslmode=require|neon\.tech|supabase\.co/.test(url) ? { rejectUnauthorized: false } : undefined,
  });
  await migrate(drizzle(pool), { migrationsFolder: "db/migrations" });
  await pool.end();
  console.log("Migrations applied.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
