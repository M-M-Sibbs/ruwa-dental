import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { db, users, doctors } from "@/db";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "./session";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: SessionPayload["role"];
  doctorId: string | null;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const jar = await cookies();
  const session = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const [row] = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, doctorId: doctors.id })
    .from(users)
    .leftJoin(doctors, eq(doctors.userId, users.id))
    .where(eq(users.id, session.userId));
  if (!row || !row.active) return null;
  return { id: row.id, name: row.name, email: row.email, role: row.role, doctorId: row.doctorId };
});

/** Use at the top of every admin page and server action. */
export async function requireUser(roles?: CurrentUser["role"][]) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (roles && !roles.includes(user.role)) redirect("/admin?denied=1");
  return user;
}

export const can = {
  manageSite: (u: CurrentUser) => u.role === "ADMIN",
  seeClinical: (u: CurrentUser) => u.role === "ADMIN" || u.role === "DOCTOR",
};
