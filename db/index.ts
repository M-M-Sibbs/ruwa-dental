import path from "node:path";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { configuredDatabaseUrl, shouldUseEmbeddedDatabase, EMBEDDED_DB_DIR } from "./config";

type DB = NodePgDatabase<typeof schema>;

// Reuse one connection across hot reloads and serverless invocations.
const g = globalThis as unknown as { __rdcDb?: DB; __rdcPool?: Pool };

function create(): DB {
  const url = configuredDatabaseUrl();
  if (url) {
    const pool =
      g.__rdcPool ??
      new Pool({
        connectionString: url,
        max: 5,
        ssl: /sslmode=require|neon\.tech|supabase\.co/.test(url) ? { rejectUnauthorized: false } : undefined,
      });
    g.__rdcPool = pool;
    return drizzlePg(pool, { schema });
  }
  if (shouldUseEmbeddedDatabase()) {
    // Loaded lazily so production servers with DATABASE_URL never touch it.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PGlite } = require("@electric-sql/pglite") as typeof import("@electric-sql/pglite");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/pglite") as typeof import("drizzle-orm/pglite");
    const dir = path.join(process.cwd(), EMBEDDED_DB_DIR);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    (require("node:fs") as typeof import("node:fs")).mkdirSync(dir, { recursive: true });
    const client = new PGlite(dir);
    return drizzle(client, { schema }) as unknown as DB;
  }
  throw new Error("DATABASE_URL is not set. Add it in Vercel → Settings → Environment Variables.");
}

// Connect on first use, so builds and imports never open a connection.
function instance(): DB {
  return g.__rdcDb ?? (g.__rdcDb = create());
}

export const db = new Proxy({} as DB, {
  get(_target, prop) {
    const real = instance();
    const value = Reflect.get(real as object, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
}) as DB;
export * from "./schema";
