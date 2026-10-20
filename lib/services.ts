import "server-only";
import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import { db, services } from "@/db";
import { slugify } from "./site";

export const getActiveServices = cache(async () =>
  db.select().from(services).where(eq(services.active, true)).orderBy(asc(services.sortOrder), asc(services.name)),
);

export async function getServiceBySlug(slug: string) {
  const list = await getActiveServices();
  return list.find((s) => slugify(s.name) === slug) ?? null;
}
