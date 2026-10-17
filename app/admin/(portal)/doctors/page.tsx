import { asc, eq } from "drizzle-orm";
import { db, doctors, branches, services, doctorServices, users } from "@/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { DoctorForm } from "@/components/admin/DoctorForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteDoctor, restoreDoctor } from "@/app/actions/admin";

export default async function DoctorsPage() {
  await requireUser(["ADMIN"]);
  const [docs, brs, svcs, links] = await Promise.all([
    db
      .select({ d: doctors, email: users.email })
      .from(doctors)
      .leftJoin(users, eq(users.id, doctors.userId))
      .orderBy(asc(doctors.createdAt)),
    db.select({ value: branches.id, label: branches.name }).from(branches),
    db.select({ value: services.id, label: services.name }).from(services).orderBy(asc(services.sortOrder)),
    db.select().from(doctorServices),
  ]);
  const team = docs.filter((x) => !x.d.deletedAt);
  const removed = docs.filter((x) => x.d.deletedAt);

  return (
    <>
      <PageHeader title="Doctors" subtitle="Add as many doctors as the clinic needs. Assign specialties, branches, services and portal access." />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="card h-fit p-6">
          <h2 className="text-2xl font-bold tracking-tight">Clinical team</h2>
          <ul className="mt-5 divide-y divide-line">
            {team.map(({ d, email }) => (
              <li key={d.id} className="py-4">
                <details>
                  <summary className="flex cursor-pointer list-none items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 font-bold text-accent-600">
                      {d.fullName.replace(/^Dr\.?\s+/i, "").charAt(0)}
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold">{d.fullName}</span>
                      <span className="block text-xs text-muted">
                        {d.specialty}{d.qualifications ? ` · ${d.qualifications}` : ""} · {email ? "Portal access enabled" : "No portal login"}
                        {!d.active && " · Inactive"}
                      </span>
                    </span>
                    <span className="link text-sm">Edit</span>
                  </summary>
                  <div className="mt-5 rounded-xl bg-surface p-4">
                    <DoctorForm
                      branches={brs}
                      services={svcs}
                      initial={{
                        id: d.id,
                        fullName: d.fullName,
                        specialty: d.specialty,
                        qualifications: d.qualifications ?? "",
                        bio: d.bio ?? "",
                        phone: d.phone ?? "",
                        publicEmail: d.email ?? "",
                        branchId: d.branchId ?? "",
                        active: d.active,
                        email: email ?? "",
                        hasLogin: !!email,
                        serviceIds: links.filter((l) => l.doctorId === d.id).map((l) => l.serviceId),
                      }}
                    />
                    <form action={deleteDoctor} className="mt-4 border-t border-line pt-4">
                      <input type="hidden" name="id" value={d.id} />
                      <ConfirmButton message={`Remove ${d.fullName}? Their login is disabled and they disappear from the website. Records are kept.`}>
                        Remove doctor
                      </ConfirmButton>
                    </form>
                  </div>
                </details>
              </li>
            ))}
          </ul>
          {removed.length > 0 && (
            <div className="mt-4 border-t border-line pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Removed</p>
              {removed.map(({ d }) => (
                <form key={d.id} action={restoreDoctor} className="mt-2 flex items-center justify-between text-sm">
                  <input type="hidden" name="id" value={d.id} />
                  <span className="text-muted">{d.fullName}</span>
                  <button className="link">Restore</button>
                </form>
              ))}
            </div>
          )}
        </section>
        <section className="card h-fit p-6">
          <h2 className="mb-5 text-2xl font-bold tracking-tight">Add another doctor</h2>
          <DoctorForm branches={brs} services={svcs} />
        </section>
      </div>
    </>
  );
}
