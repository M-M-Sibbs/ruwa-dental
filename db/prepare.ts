// Gets the database ready before the first request.
// For the built-in local database: creates the tables and loads starting content.
import path from "node:path";
import { sql } from "drizzle-orm";
import { db, siteSettings } from "./index";
import { configuredDatabaseUrl, shouldUseEmbeddedDatabase } from "./config";
import { seedDatabase } from "./seed";

export type DbProblem = { title: string; detail: string; steps: string[] };

const g = globalThis as unknown as { __rdcPrepared?: Promise<void>; __rdcHealthy?: boolean };

export function prepareDatabase() {
  if (!g.__rdcPrepared) {
    g.__rdcPrepared = (async () => {
      if (!shouldUseEmbeddedDatabase()) return;
      const { migrate } = await import("drizzle-orm/pglite/migrator");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await migrate(db as any, { migrationsFolder: path.join(process.cwd(), "db/migrations") });
      await seedDatabase(db);
      console.log("✓ Built-in database ready (.data/pglite). Admin login: admin@ruwadental.co.zw / ChangeMe!2026");
    })().catch((e) => {
      g.__rdcPrepared = undefined; // let the next request retry
      throw e;
    });
  }
  return g.__rdcPrepared;
}

/** Returns null when the database is usable, otherwise what is wrong and how to fix it. */
export async function checkDatabase(): Promise<DbProblem | null> {
  if (g.__rdcHealthy) return null;
  // Never touch the database while `next build` prerenders static pages.
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  try {
    await prepareDatabase();
    await db.select({ one: sql`1` }).from(siteSettings).limit(1);
    g.__rdcHealthy = true;
    return null;
  } catch (e) {
    return explain(e);
  }
}

function explain(e: unknown): DbProblem {
  const err = e as { message?: string; code?: string; cause?: { code?: string; message?: string } };
  const code = err.cause?.code ?? err.code ?? "";
  const msg = `${err.message ?? ""} ${err.cause?.message ?? ""}`;
  console.error("Database check failed:", msg);

  if (!configuredDatabaseUrl() && process.env.VERCEL) {
    return {
      title: "The database isn't connected yet",
      detail: "This Vercel project has no DATABASE_URL.",
      steps: [
        "In Vercel, open the project → Storage → Create Database → Neon, and connect it.",
        "Add DIRECT_URL (same value) and AUTH_SECRET under Settings → Environment Variables.",
        "Redeploy, then run the seed once (see README).",
      ],
    };
  }
  if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT" || /ECONNREFUSED|ENOTFOUND|ETIMEDOUT/.test(msg)) {
    return {
      title: "Can't reach the database",
      detail: "DATABASE_URL in your .env file points to a database server that isn't answering.",
      steps: [
        "Check the address in DATABASE_URL, or start your Postgres server.",
        "Or delete the DATABASE_URL line from .env to use the built-in local database, then restart.",
      ],
    };
  }
  if (code === "28P01" || /password authentication failed/i.test(msg)) {
    return {
      title: "The database rejected the login",
      detail: "The user name or password in DATABASE_URL is wrong.",
      steps: ["Copy the connection string again from Neon (or your Postgres server) into .env, then restart."],
    };
  }
  if (code === "42P01" || /relation .* does not exist/i.test(msg)) {
    return {
      title: "The database has no tables yet",
      detail: "The database is connected but the tables haven't been created.",
      steps: ["Run: npm run db:migrate", "Then: npm run db:seed", "Then reload this page."],
    };
  }
  return {
    title: "The database isn't ready",
    detail: msg.trim().slice(0, 300) || "Unknown database error.",
    steps: ["Check DATABASE_URL in .env, or remove it to use the built-in local database, then restart."],
  };
}
