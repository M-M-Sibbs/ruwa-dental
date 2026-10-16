import { asc, ne } from "drizzle-orm";
import { db, users } from "@/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { PasswordForm, StaffForm } from "@/components/admin/AccountForms";
import { toggleStaff } from "@/app/actions/admin";

const ROLE = { ADMIN: "Administrator", DOCTOR: "Doctor", RECEPTION: "Reception" } as const;

export default async function AccountPage() {
  const user = await requireUser();
  const staff = user.role === "ADMIN" ? await db.select().from(users).where(ne(users.id, user.id)).orderBy(asc(users.name)) : [];
  return (
    <>
      <PageHeader title="Account" subtitle={`Signed in as ${user.email}`} />
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card h-fit p-6">
          <h2 className="mb-5 text-xl font-bold tracking-tight">Change password</h2>
          <PasswordForm />
        </section>
        {user.role === "ADMIN" && (
          <section className="card h-fit p-6">
            <h2 className="text-xl font-bold tracking-tight">Staff logins</h2>
            <p className="mt-1 text-sm text-muted">Doctor logins are managed on the Doctors page.</p>
            <ul className="mt-4 divide-y divide-line">
              {staff.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    <span className="font-semibold">{s.name}</span>
                    <span className="text-muted"> · {s.email} · {ROLE[s.role]}</span>
                    {!s.active && <span className="pill ml-2 bg-surface text-muted">Disabled</span>}
                  </span>
                  {s.role !== "DOCTOR" && (
                    <form action={toggleStaff}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className={s.active ? "text-sm font-semibold text-danger" : "link text-sm"}>{s.active ? "Disable" : "Enable"}</button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-line pt-6">
              <h3 className="mb-4 font-semibold">Add a staff login</h3>
              <StaffForm />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
