// Runs once when the server starts: prepares the built-in local database if used.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { prepareDatabase } = await import("./db/prepare");
    await prepareDatabase().catch((e) => console.error("Database setup failed:", e?.message ?? e));
  }
}
