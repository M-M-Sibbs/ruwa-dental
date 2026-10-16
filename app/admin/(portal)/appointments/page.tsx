import Link from "next/link";
import { and, asc, desc, eq, ilike, isNull, or, type SQL } from "drizzle-orm";
import { db, appointments, patients, doctors, services, branches } from "@/db";
import { requireUser } from "@/lib/auth";
import { formatDate, formatDateTime, todayISO } from "@/lib/dates";
import { displayPhone } from "@/lib/phone";
import { STATUS_LABEL, STATUS_ORDER } from "@/lib/status";
import { PageHeader } from "@/components/admin/PageHeader";
import { AppointmentRow } from "@/components/admin/AppointmentRow";
import type { AppointmentStatus } from "@/db/schema";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; date?: string; view?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const q = sp.q?.trim();
  const view = sp.view ?? (q ? "all" : "upcoming");

  const where: (SQL | undefined)[] = [];
  if (user.role === "DOCTOR" && user.doctorId) where.push(eq(appointments.doctorId, user.doctorId));
  if (sp.status && STATUS_ORDER.includes(sp.status as AppointmentStatus)) where.push(eq(appointments.status, sp.status as AppointmentStatus));
  if (sp.date) where.push(eq(appointments.preferredDate, sp.date));
  if (view === "today") where.push(eq(appointments.preferredDate, todayISO()));
  if (q) {
    const like = `%${q}%`;
    const digits = q.replace(/\D/g, "");
    where.push(
      or(
        ilike(appointments.trackingCode, like),
        ilike(patients.firstName, like),
        ilike(patients.lastName, like),
        digits.length >= 4 ? ilike(patients.phone, `%${digits.replace(/^0/, "")}%`) : undefined,
      ),
    );
  }

  const rows = await db
    .select({
      a: appointments,
      first: patients.firstName,
      last: patients.lastName,
      phone: patients.phone,
      patientId: patients.id,
      service: services.name,
      branch: branches.name,
    })
    .from(appointments)
    .innerJoin(patients, eq(patients.id, appointments.patientId))
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .leftJoin(branches, eq(branches.id, appointments.branchId))
    .where(and(...where))
    .orderBy(view === "upcoming" ? asc(appointments.preferredDate) : desc(appointments.preferredDate), asc(appointments.preferredTime))
    .limit(200);

  const list = view === "upcoming" ? rows.filter((r) => r.a.preferredDate >= todayISO() || r.a.status === "REQUESTED") : rows;

  const doctorList = await db
    .select({ id: doctors.id, name: doctors.fullName })
    .from(doctors)
    .where(and(eq(doctors.active, true), isNull(doctors.deletedAt)));

  const tabs = [
    { v: "upcoming", l: "Upcoming" },
    { v: "today", l: "Today" },
    { v: "all", l: "All" },
  ];

  return (
    <>
      <PageHeader title="Appointments" subtitle="Confirm, reschedule, assign doctors and track every visit." />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <nav className="flex rounded-xl border border-line bg-white p-1" aria-label="View">
          {tabs.map((t) => (
            <Link
              key={t.v}
              href={`/admin/appointments?view=${t.v}`}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium ${view === t.v ? "bg-accent-500 text-white" : "text-muted hover:text-ink"}`}
            >
              {t.l}
            </Link>
          ))}
        </nav>
        <form className="flex flex-1 flex-wrap gap-2" action="/admin/appointments">
          <input type="hidden" name="view" value="all" />
          <input name="q" defaultValue={q} placeholder="Search name, phone or code" className="input max-w-xs flex-1 bg-white" />
          <select name="status" defaultValue={sp.status ?? ""} className="input w-auto bg-white">
            <option value="">All statuses</option>
            {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <input type="date" name="date" defaultValue={sp.date} className="input w-auto bg-white" aria-label="Date" />
          <button className="btn-soft py-2.5">Filter</button>
          {(q || sp.status || sp.date) && <Link href="/admin/appointments?view=all" className="btn-ghost py-2.5">Clear</Link>}
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="border-b border-line bg-surface/60 text-left text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Patient</th>
              <th className="px-5 py-3 font-semibold">Requested</th>
              <th className="px-5 py-3 font-semibold">Service</th>
              <th className="px-5 py-3 font-semibold">Doctor / confirmation</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">No appointments match.</td></tr>
            )}
            {list.map((r) => (
              <AppointmentRow
                key={r.a.id}
                canAssign={user.role !== "DOCTOR"}
                doctors={doctorList}
                row={{
                  id: r.a.id,
                  code: r.a.trackingCode,
                  patientId: r.patientId,
                  patient: `${r.first} ${r.last}`,
                  phone: displayPhone(r.phone),
                  date: r.a.preferredDate,
                  dateLabel: formatDate(r.a.preferredDate),
                  time: r.a.preferredTime,
                  confirmedTime: r.a.confirmedTime ?? "",
                  doctorId: r.a.doctorId ?? "",
                  status: r.a.status,
                  note: r.a.clinicNote ?? "",
                  reason: r.a.reason ?? "",
                  service: r.service,
                  branch: r.branch ?? "",
                  createdAt: formatDateTime(r.a.createdAt),
                  whatsapp: !!r.a.whatsappNotifiedAt,
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
