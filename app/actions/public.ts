"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db, appointments, patients, services, doctors, branches, feedback } from "@/db";
import { normalizeZimPhone, displayPhone } from "@/lib/phone";
import { newPatientNumber, newTrackingCode } from "@/lib/codes";
import { todayISO, formatDate } from "@/lib/dates";
import { rateLimit } from "@/lib/rate-limit";
import { getSettings } from "@/lib/settings";
import { sendClinicBookingAlert } from "@/lib/whatsapp";

export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
  data?: Record<string, string>;
};

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const k = String(issue.path[0] ?? "form");
    if (!out[k]) out[k] = issue.message;
  }
  return out;
}

function values(fd: FormData) {
  const v: Record<string, string> = {};
  fd.forEach((val, key) => {
    if (typeof val === "string" && !key.startsWith("$")) v[key] = val;
  });
  return v;
}

const opt = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

// ---------------- Booking ----------------

const bookingSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name").max(60),
  lastName: z.string().trim().min(1, "Enter your last name").max(60),
  phone: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const n = normalizeZimPhone(v);
      if (!n) {
        ctx.addIssue({ code: "custom", message: "Enter a valid Zimbabwe number, e.g. 078 339 7863" });
        return z.NEVER;
      }
      return n;
    }),
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .refine((v) => !v || z.email().safeParse(v).success, "Enter a valid email address"),
  serviceId: z.string().min(1, "Choose a service"),
  doctorId: opt(64),
  branchId: opt(64),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date")
    .refine((d) => d >= todayISO(), "Choose today or a later date"),
  preferredTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Choose a time")
    .refine((t) => t >= "00:00" && t <= "23:59", "Choose a valid time"),
  reason: opt(500),
});

export async function submitBooking(_prev: FormState, fd: FormData): Promise<FormState> {
  const v = values(fd);
  // Honeypot: real people never fill this hidden field.
  if (v.website) return { ok: false, message: "Something went wrong. Please try again.", values: v };
  if (!rateLimit(`book:${await clientIp()}`, 5)) {
    return { ok: false, message: "Too many requests. Please wait a few minutes or WhatsApp us.", values: v };
  }

  const parsed = bookingSchema.safeParse(v);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: v };
  const d = parsed.data;

  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, d.serviceId), eq(services.active, true)));
  if (!service) return { ok: false, errors: { serviceId: "Choose a service" }, values: v };

  let doctor: typeof doctors.$inferSelect | undefined;
  if (d.doctorId) {
    [doctor] = await db
      .select()
      .from(doctors)
      .where(and(eq(doctors.id, d.doctorId), eq(doctors.active, true), isNull(doctors.deletedAt)));
  }
  const [branch] = d.branchId
    ? await db.select().from(branches).where(eq(branches.id, d.branchId))
    : await db.select().from(branches).limit(1);

  // Match an existing patient by phone, or create a new record.
  let [patient] = await db
    .select()
    .from(patients)
    .where(and(eq(patients.phone, d.phone), isNull(patients.deletedAt)))
    .limit(1);
  if (!patient) {
    [patient] = await db
      .insert(patients)
      .values({
        patientNumber: newPatientNumber(),
        firstName: d.firstName,
        lastName: d.lastName,
        phone: d.phone,
        email: d.email || null,
      })
      .returning();
  } else if (d.email && !patient.email) {
    await db.update(patients).set({ email: d.email }).where(eq(patients.id, patient.id));
  }

  let appt: typeof appointments.$inferSelect | undefined;
  for (let attempt = 0; attempt < 5 && !appt; attempt++) {
    try {
      [appt] = await db
        .insert(appointments)
        .values({
          trackingCode: newTrackingCode(),
          preferredDate: d.preferredDate,
          preferredTime: d.preferredTime,
          reason: d.reason ?? null,
          patientId: patient.id,
          serviceId: service.id,
          doctorId: doctor?.id ?? null,
          branchId: branch?.id ?? null,
        })
        .returning();
    } catch (e) {
      if (attempt === 4) throw e; // tracking code collision is near-impossible; retry anyway
    }
  }
  if (!appt) return { ok: false, message: "We could not save your booking. Please try again.", values: v };

  // WhatsApp alert to the clinic. The booking is already saved, so a failure here
  // never loses it; the confirmation page also offers a click-to-chat button.
  const s = await getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const sent = await sendClinicBookingAlert(
    {
      trackingCode: appt.trackingCode,
      patientName: `${d.firstName} ${d.lastName}`,
      phone: displayPhone(d.phone),
      service: service.name,
      doctor: doctor?.fullName ?? "Any available doctor",
      date: formatDate(d.preferredDate),
      time: d.preferredTime,
      reason: d.reason ?? "",
      adminUrl: `${siteUrl}/admin/appointments?q=${appt.trackingCode}`,
    },
    s.whatsappNumber,
  );
  if (sent) {
    await db.update(appointments).set({ whatsappNotifiedAt: new Date() }).where(eq(appointments.id, appt.id));
  }

  redirect(`/booking/${appt.trackingCode}?p=${encodeURIComponent(d.phone.slice(-4))}`);
}

// ---------------- Feedback ----------------

const feedbackSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(80),
  phone: opt(30),
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .refine((v) => !v || z.email().safeParse(v).success, "Enter a valid email address"),
  rating: z.coerce.number().int().min(1, "Choose a rating").max(5),
  message: z.string().trim().min(3, "Tell us a little more").max(1000),
});

export async function submitFeedback(_prev: FormState, fd: FormData): Promise<FormState> {
  const v = values(fd);
  if (v.website) return { ok: true, message: "Thank you. Your feedback has been received." };
  if (!rateLimit(`fb:${await clientIp()}`, 3)) {
    return { ok: false, message: "Too many submissions. Please try again later.", values: v };
  }
  const parsed = feedbackSchema.safeParse(v);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error), values: v };
  const d = parsed.data;
  await db.insert(feedback).values({
    name: d.name,
    phone: d.phone ? (normalizeZimPhone(d.phone) ?? d.phone) : null,
    email: d.email || null,
    rating: d.rating,
    message: d.message,
  });
  return { ok: true, message: "Thank you. Your feedback has been received." };
}

// ---------------- Tracking ----------------

export async function trackBooking(_prev: FormState, fd: FormData): Promise<FormState> {
  const v = values(fd);
  if (!rateLimit(`track:${await clientIp()}`, 20)) {
    return { ok: false, message: "Too many attempts. Please wait a few minutes.", values: v };
  }
  const code = (v.code || "").replace(/\s+/g, "").toUpperCase();
  const phone = normalizeZimPhone(v.phone || "");
  const errors: Record<string, string> = {};
  if (!/^RDC-[A-Z0-9]{6,8}$/.test(code)) errors.code = "Enter the code you received, e.g. RDC-EC159C";
  if (!phone) errors.phone = "Enter the phone number you used when booking";
  if (Object.keys(errors).length) return { ok: false, errors, values: v };
  const [row] = await db
    .select({
      code: appointments.trackingCode,
      status: appointments.status,
      date: appointments.preferredDate,
      time: appointments.preferredTime,
      confirmedTime: appointments.confirmedTime,
      note: appointments.clinicNote,
      service: services.name,
      doctor: doctors.fullName,
      branchName: branches.name,
      branchAddress: branches.address,
    })
    .from(appointments)
    .innerJoin(patients, eq(patients.id, appointments.patientId))
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .leftJoin(doctors, eq(doctors.id, appointments.doctorId))
    .leftJoin(branches, eq(branches.id, appointments.branchId))
    .where(and(eq(appointments.trackingCode, code), eq(patients.phone, phone!)));
  if (!row) {
    return {
      ok: false,
      message: "We couldn't find a booking with that code and phone number. Check both and try again.",
      values: v,
    };
  }
  return {
    ok: true,
    values: v,
    data: {
      code: row.code,
      status: row.status,
      date: formatDate(row.date),
      time: row.confirmedTime || row.time,
      doctor: row.doctor ?? "Any available doctor",
      service: row.service,
      location: row.branchAddress ?? "",
      note: row.note ?? "",
    },
  };
}
