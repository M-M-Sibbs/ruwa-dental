import Link from "next/link";
import { and, desc, ilike, isNotNull, isNull, or } from "drizzle-orm";
import { db, patients } from "@/db";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { displayPhone } from "@/lib/phone";
import { PageHeader, Notice } from "@/components/admin/PageHeader";
import { PatientForm } from "@/components/admin/PatientForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deletePatient, restorePatient } from "@/app/actions/admin";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; deleted?: string; add?: string; archived?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const q = sp.q?.trim();
  const archived = sp.archived === "1" && user.role === "ADMIN";
  const digits = q?.replace(/\D/g, "").replace(/^0/, "") ?? "";
  const rows = await db
    .select()
    .from(patients)
    .where(
      and(
        archived ? isNotNull(patients.deletedAt) : isNull(patients.deletedAt),
        q
          ? or(
              ilike(patients.firstName, `%${q}%`),
              ilike(patients.lastName, `%${q}%`),
              ilike(patients.patientNumber, `%${q}%`),
              digits.length >= 4 ? ilike(patients.phone, `%${digits}%`) : undefined,
            )
          : undefined,
      ),
    )
    .orderBy(desc(patients.createdAt))
    .limit(200);

  return (
    <>
      <PageHeader title="Patients" subtitle="Add patients manually, search records and open complete medical histories.">
        <form action="/admin/patients" className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Search name, patient no. or phone" className="input w-72 bg-white" />
          <button className="btn-soft py-2.5">Search</button>
        </form>
      </PageHeader>
      {sp.deleted && <Notice>Patient record archived. An administrator can restore it.</Notice>}

      <details className="card mb-6 p-6" open={sp.add === "1"}>
        <summary className="cursor-pointer text-xl font-bold tracking-tight">Add patient</summary>
        <div className="mt-6"><PatientForm mode="create" /></div>
      </details>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line bg-surface/60 text-left text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Patient</th>
              <th className="px-5 py-3 font-semibold">Patient no.</th>
              <th className="px-5 py-3 font-semibold">Phone</th>
              <th className="px-5 py-3 font-semibold">Joined</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">No patients found.</td></tr>}
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-surface/50">
                <td className="px-5 py-3 font-semibold">{p.firstName} {p.lastName}</td>
                <td className="px-5 py-3 font-mono text-xs">{p.patientNumber}</td>
                <td className="px-5 py-3">{displayPhone(p.phone)}</td>
                <td className="px-5 py-3">{formatDate(p.createdAt.toISOString())}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-4">
                    {archived ? (
                      <form action={restorePatient}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="link text-sm">Restore</button>
                      </form>
                    ) : (
                      <>
                        <Link href={`/admin/patients/${p.id}`} className="link text-sm">Open record →</Link>
                        {user.role !== "DOCTOR" && (
                          <form action={deletePatient}>
                            <input type="hidden" name="id" value={p.id} />
                            <ConfirmButton message={`Archive ${p.firstName} ${p.lastName}'s record? It can be restored by an administrator.`}>Delete</ConfirmButton>
                          </form>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {user.role === "ADMIN" && (
        <p className="mt-4 text-sm">
          <Link href={archived ? "/admin/patients" : "/admin/patients?archived=1"} className="text-muted hover:text-ink">
            {archived ? "← Back to active patients" : "View archived patients"}
          </Link>
        </p>
      )}
    </>
  );
}
