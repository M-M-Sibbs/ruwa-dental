import Link from "next/link";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { db, appointments, patients, doctors, services } from "@/db";
import { requireUser } from "@/lib/auth";
import { todayISO, formatDate } from "@/lib/dates";
import { StatusPill } from "@/components/StatusPill";
import { Notice } from "@/components/admin/PageHeader";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const today = todayISO();
  const mine = user.role === "DOCTOR" && user.doctorId ? eq(appointments.doctorId, user.doctorId) : undefined;

  const [[todayCount], [awaiting], [patientCount], [doctorCount], recent] = await Promise.all([
    db.select({ n: count() }).from(appointments).where(and(eq(appointments.preferredDate, today), mine)),
    db.select({ n: count() }).from(appointments).where(and(eq(appointments.status, "REQUESTED"), mine)),
    db.select({ n: count() }).from(patients).where(isNull(patients.deletedAt)),
    db.select({ n: count() }).from(doctors).where(and(eq(doctors.active, true), isNull(doctors.deletedAt))),
    db
      .select({
        id: appointments.id,
        code: appointments.trackingCode,
        date: appointments.preferredDate,
        time: appointments.preferredTime,
        confirmedTime: appointments.confirmedTime,
        status: appointments.status,
        first: patients.firstName,
        last: patients.lastName,
        service: services.name,
        doctor: doctors.fullName,
      })
      .from(appointments)
      .innerJoin(patients, eq(patients.id, appointments.patientId))
      .innerJoin(services, eq(services.id, appointments.serviceId))
      .leftJoin(doctors, eq(doctors.id, appointments.doctorId))
      .where(mine)
      .orderBy(desc(appointments.createdAt))
      .limit(8),
  ]);

  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Harare" }).format(new Date()));
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user.name.replace(/^Dr\.?\s+/i, "").split(" ")[0];

  const stats = [
    { label: "Today's appointments", n: todayCount.n, sub: "scheduled today" },
    { label: "Awaiting confirmation", n: awaiting.n, sub: "needs attention", warn: awaiting.n > 0 },
    { label: "Total patients", n: patientCount.n, sub: "patient records" },
    { label: "Active doctors", n: doctorCount.n, sub: "clinical team" },
  ];

  return (
    <>
      {denied && <Notice tone="danger">You don&apos;t have access to that page.</Notice>}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.02em]">{greet}, {firstName} 👋</h1>
          <p className="mt-1.5 text-muted">Here&apos;s what&apos;s happening at the clinic today.</p>
        </div>
        <Link href="/admin/appointments" className="btn-primary">Manage appointments</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-xs font-medium text-muted">{s.label}</p>
            <p className={`mt-3 text-3xl font-bold tracking-tight ${s.warn ? "text-warning" : "text-ink"}`}>{s.n}</p>
            <p className="mt-1 text-xs text-muted">{s.sub}</p>
          </div>
        ))}
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-semibold">Recent appointments</h2>
          <Link href="/admin/appointments" className="link text-sm">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-y border-line bg-surface/60 text-left text-[11px] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Patient</th>
                <th className="px-5 py-3 font-semibold">Service</th>
                <th className="px-5 py-3 font-semibold">Doctor</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recent.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">No appointments yet.</td></tr>
              )}
              {recent.map((r) => (
                <tr key={r.id} className="hover:bg-surface/50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/appointments?q=${r.code}`} className="font-semibold text-ink hover:text-accent-600">{r.first} {r.last}</Link>
                    <p className="font-mono text-xs text-muted">{r.code}</p>
                  </td>
                  <td className="px-5 py-3">{r.service}</td>
                  <td className="px-5 py-3">{r.doctor ?? <span className="text-muted">Unassigned</span>}</td>
                  <td className="px-5 py-3">{formatDate(r.date)} · {r.confirmedTime ?? r.time}</td>
                  <td className="px-5 py-3"><StatusPill status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
