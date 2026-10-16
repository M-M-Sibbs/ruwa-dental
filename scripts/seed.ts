// Loads starting content into the database in DATABASE_URL. Safe to run twice.
import "dotenv/config";
import { configuredDatabaseUrl } from "../db/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";
import { seedDatabase } from "../db/seed";

async function main() {
  const direct = process.env.DIRECT_URL?.trim();
  const url = direct && !/USER:PASSWORD@HOST/i.test(direct) ? direct : configuredDatabaseUrl();
  if (!url) {
    console.log("No DATABASE_URL set — the built-in local database seeds itself when you run `npm run dev`.");
    return;
  }
  const pool = new Pool({ connectionString: url, ssl: /sslmode=require|neon\.tech|supabase\.co/.test(url) ? { rejectUnauthorized: false } : undefined });
  const email = await seedDatabase(drizzle(pool, { schema }));
  await pool.end();
  console.log(`Seeded. Admin login: ${email}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
