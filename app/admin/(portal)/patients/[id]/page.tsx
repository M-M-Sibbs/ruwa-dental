import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db, patients, consultations, prescriptions, doctors, appointments, services } from "@/db";
import { requireUser, can } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/dates";
import { displayPhone } from "@/lib/phone";
import { Notice } from "@/components/admin/PageHeader";
import { PatientForm } from "@/components/admin/PatientForm";
import { ConsultationForm } from "@/components/admin/ConsultationForm";
import { StatusPill } from "@/components/StatusPill";

export default async function PatientRecord({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { created } = await searchParams;
  const [p] = await db.select().from(patients).where(eq(patients.id, id));
  if (!p) notFound();
  const clinical = can.seeClinical(user);

  const [history, appts, docs] = await Promise.all([
    clinical
      ? db
          .select({ c: consultations, doctor: doctors.fullName })
          .from(consultations)
          .leftJoin(doctors, eq(doctors.id, consultations.doctorId))
          .where(eq(consultations.patientId, id))
          .orderBy(desc(consultations.date))
      : Promise.resolve([]),
    db
      .select({ a: appointments, service: services.name, doctor: doctors.fullName })
      .from(appointments)
      .innerJoin(services, eq(services.id, appointments.serviceId))
      .leftJoin(doctors, eq(doctors.id, appointments.doctorId))
      .where(eq(appointments.patientId, id))
      .orderBy(desc(appointments.preferredDate)),
    db
      .select({ value: doctors.id, label: doctors.fullName })
      .from(doctors)
      .where(and(eq(doctors.active, true), isNull(doctors.deletedAt))),
  ]);
  const rx = history.length
    ? await db.select().from(prescriptions).where(inArray(prescriptions.consultationId, history.map((h) => h.c.id)))
    : [];

  const profile = [
    { l: "Blood group", v: p.bloodGroup },
    { l: "Allergies", v: p.allergies },
    { l: "Chronic conditions", v: p.chronicConditions },
    { l: "Emergency contact", v: p.emergencyContact },
    { l: "Date of birth", v: p.dateOfBirth ? formatDate(p.dateOfBirth) : null },
    { l: "Gender", v: p.gender },
    { l: "National ID", v: p.nationalId },
    { l: "Address", v: p.address },
  ];
  const openAppts = appts
    .filter((a) => a.a.status === "REQUESTED" || a.a.status === "CONFIRMED")
    .map((a) => ({ value: a.a.id, label: `${formatDate(a.a.preferredDate)} · ${a.service}` }));

  return (
    <>
      {created && <Notice>Patient added.</Notice>}
      {p.deletedAt && <Notice tone="danger">This record is archived.</Notice>}
      <Link href="/admin/patients" className="text-sm text-muted hover:text-ink">← All patients</Link>
      <div className="mb-8 mt-3">
        <p className="font-mono text-xs font-semibold tracking-wider text-accent-600">{p.patientNumber}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-[-0.02em]">{p.firstName} {p.lastName}</h1>
        <p className="mt-1 text-muted">{displayPhone(p.phone)}{p.email ? ` · ${p.email}` : ""}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-xl font-bold tracking-tight">Medical profile</h2>
            <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {profile.map((f) => (
                <div key={f.l}>
                  <dt className="text-xs text-muted">{f.l}</dt>
                  <dd className={`mt-0.5 text-sm ${f.v ? "font-medium" : "text-muted"}`}>{f.v || "Not recorded"}</dd>
                </div>
              ))}
            </dl>
            <details className="mt-6 border-t border-line pt-4">
              <summary className="link cursor-pointer text-sm">Edit patient details</summary>
              <div className="mt-5">
                <PatientForm
                  mode="edit"
                  initial={{
                    id: p.id,
                    firstName: p.firstName,
                    lastName: p.lastName,
                    phone: displayPhone(p.phone),
                    email: p.email ?? "",
                    dateOfBirth: p.dateOfBirth ?? "",
                    gender: p.gender ?? "",
                    nationalId: p.nationalId ?? "",
                    bloodGroup: p.bloodGroup ?? "",
                    address: p.address ?? "",
                    allergies: p.allergies ?? "",
                    chronicConditions: p.chronicConditions ?? "",
                    emergencyContact: p.emergencyContact ?? "",
                  }}
                />
              </div>
            </details>
          </section>

          <section className="card p-6">
            <h2 className="text-xl font-bold tracking-tight">Medical history</h2>
            {!clinical ? (
              <p className="mt-4 text-sm text-muted">Clinical notes are visible to dentists and administrators only.</p>
            ) : history.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No consultations recorded yet.</p>
            ) : (
              <ol className="mt-5 space-y-5">
                {history.map(({ c, doctor }) => (
                  <li key={c.id} className="border-l-2 border-accent-100 pl-4">
                    <p className="text-sm font-semibold">
                      {formatDateTime(c.date)} · {doctor ?? "Clinic"}
                    </p>
                    <dl className="mt-2 grid gap-1 text-sm">
                      {c.presentingComplaint && <Line l="Complaint" v={c.presentingComplaint} />}
                      {(c.bp || c.temperatureC || c.weightKg || c.pulse) && (
                        <Line
                          l="Vitals"
                          v={[c.bp && `BP ${c.bp}`, c.temperatureC && `${c.temperatureC} °C`, c.weightKg && `${c.weightKg} kg`, c.pulse && `pulse ${c.pulse}`]
                            .filter(Boolean)
                            .join(" · ")}
                        />
                      )}
                      {c.clinicalNotes && <Line l="Notes" v={c.clinicalNotes} />}
                      {c.diagnosis && <Line l="Diagnosis" v={c.diagnosis} />}
                      {c.treatment && <Line l="Treatment" v={c.treatment} />}
                      {c.followUpDate && <Line l="Follow-up" v={formatDate(c.followUpDate)} />}
                    </dl>
                    {rx
                      .filter((r) => r.consultationId === c.id)
                      .map((r) => (
                        <p key={r.id} className="mt-2 rounded-lg bg-accent-50 px-3 py-2 text-xs text-ink">
                          <strong>Prescription:</strong> {r.medicine}
                          {[r.dosage, r.frequency, r.duration].filter(Boolean).length ? ` — ${[r.dosage, r.frequency, r.duration].filter(Boolean).join(", ")}` : ""}
                          {r.instructions ? `. ${r.instructions}` : ""}
                        </p>
                      ))}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="card p-6">
            <h2 className="text-xl font-bold tracking-tight">Appointments</h2>
            {appts.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No appointments.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {appts.map(({ a, service, doctor }) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <span>
                      <span className="font-medium">{formatDate(a.preferredDate)} · {a.confirmedTime ?? a.preferredTime}</span>
                      <span className="text-muted"> — {service} · {doctor ?? "Unassigned"}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <Link href={`/admin/appointments?q=${a.trackingCode}`} className="font-mono text-xs text-muted hover:text-ink">{a.trackingCode}</Link>
                      <StatusPill status={a.status} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {clinical && (
          <section className="card h-fit p-6 xl:sticky xl:top-6">
            <h2 className="mb-5 text-xl font-bold tracking-tight">New consultation</h2>
            <ConsultationForm patientId={p.id} appointments={openAppts} doctors={docs} pickDoctor={!user.doctorId} />
          </section>
        )}
      </div>
    </>
  );
}

function Line({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 shrink-0 text-muted">{l}</dt>
      <dd className="whitespace-pre-line">{v}</dd>
    </div>
  );
}
