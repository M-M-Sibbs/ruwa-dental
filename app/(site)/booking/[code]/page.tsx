import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, appointments, patients, services, doctors } from "@/db";
import { formatDate } from "@/lib/dates";
import { displayPhone } from "@/lib/phone";
import { getSettings } from "@/lib/settings";
import { bookingText, waLink } from "@/lib/whatsapp";
import { Check, WhatsApp } from "@/components/Icons";

export const metadata: Metadata = { title: "Request received", robots: { index: false } };

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const { code } = await params;
  const { p } = await searchParams;
  const [row] = await db
    .select({
      a: appointments,
      firstName: patients.firstName,
      lastName: patients.lastName,
      phone: patients.phone,
      service: services.name,
      doctor: doctors.fullName,
    })
    .from(appointments)
    .innerJoin(patients, eq(patients.id, appointments.patientId))
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .leftJoin(doctors, eq(doctors.id, appointments.doctorId))
    .where(eq(appointments.trackingCode, code.toUpperCase()));

  // Only someone who knows the phone's last 4 digits sees the details.
  if (!row || !p || !row.phone.endsWith(p)) notFound();

  const s = await getSettings();
  const doctor = row.doctor ?? "Any available doctor";
  const chat = waLink(
    s.whatsappNumber,
    bookingText(
      {
        trackingCode: row.a.trackingCode,
        patientName: `${row.firstName} ${row.lastName}`,
        phone: displayPhone(row.phone),
        service: row.service,
        doctor,
        date: formatDate(row.a.preferredDate),
        time: row.a.preferredTime,
        reason: row.a.reason ?? "",
        adminUrl: "",
      },
      false,
    ),
  );

  return (
    <section className="bg-gradient-to-b from-accent-50 to-white py-16 md:py-24">
      <div className="container-x max-w-2xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-success">
          <Check className="h-7 w-7" />
        </span>
        <p className="eyebrow mt-6">Request received</p>
        <h1 className="h-display mt-3 text-5xl sm:text-6xl">Thank you, {row.firstName}.</h1>
        <p className="mx-auto mt-5 max-w-md text-muted">
          Your appointment request has been sent to the clinic. The team will confirm the final time and location.
        </p>

        <dl className="card mx-auto mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-5 p-6 text-left">
          <div>
            <dt className="text-xs text-muted">Tracking code</dt>
            <dd className="mt-1 font-mono text-lg font-bold tracking-wide text-ink">{row.a.trackingCode}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Date</dt>
            <dd className="mt-1 font-semibold">{formatDate(row.a.preferredDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Preferred time</dt>
            <dd className="mt-1 font-semibold">{row.a.preferredTime}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Doctor</dt>
            <dd className="mt-1 font-semibold">{doctor}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-muted">Service</dt>
            <dd className="mt-1 font-semibold">{row.service}</dd>
          </div>
        </dl>

        <p className="mx-auto mt-6 max-w-md text-sm text-muted">
          <strong className="text-ink">Keep this code safe.</strong> You will need it together with your phone number to track this appointment.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/track-booking" className="btn-primary">Track booking</Link>
          <a href={chat} target="_blank" rel="noopener" className="btn bg-[#25D366] text-white hover:bg-[#1fb958]">
            <WhatsApp /> Message us on WhatsApp
          </a>
          <Link href="/" className="btn-soft">Return home</Link>
        </div>
      </div>
    </section>
  );
}
