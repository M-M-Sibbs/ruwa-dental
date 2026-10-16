// Decides which database the app uses.
//  - DATABASE_URL set → that Postgres server (Neon/Supabase on Vercel, or your own).
//  - Not set, running on your own computer → a built-in database saved in ./.data
//    (PGlite: real Postgres compiled to WebAssembly, nothing to install).

const PLACEHOLDER = /USER:PASSWORD@HOST/i;

export function configuredDatabaseUrl(): string | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url || PLACEHOLDER.test(url)) return null;
  return url;
}

export function shouldUseEmbeddedDatabase() {
  return !configuredDatabaseUrl() && !process.env.VERCEL;
}

export const EMBEDDED_DB_DIR = ".data/pglite";
