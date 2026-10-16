import "server-only";
import { db, auditLogs } from "@/db";

export async function audit(userId: string | null, action: string, entity: string, entityId: string, details?: unknown) {
  try {
    await db.insert(auditLogs).values({
      userId,
      action,
      entity,
      entityId,
      details: details === undefined ? null : JSON.stringify(details),
    });
  } catch (e) {
    console.error("audit log failed", e);
  }
}
