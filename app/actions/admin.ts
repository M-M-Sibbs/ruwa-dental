"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, eq, gt, lt, desc, ne } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  appointments,
  patients,
  consultations,
  prescriptions,
  doctors,
  doctorServices,
  services,
  feedback,
  siteSettings,
  users,
} from "@/db";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { newPatientNumber } from "@/lib/codes";
import { normalizeZimPhone } from "@/lib/phone";
import type { FormState } from "./public";

// ---------- helpers ----------
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const optStr = (fd: FormData, k: string) => str(fd, k) || null;

function errs(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = String(i.path[0] ?? "form");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}
function vals(fd: FormData) {
  const v: Record<string, string> = {};
  fd.forEach((x, k) => {
    if (typeof x === "string" && !k.startsWith("$") && k !== "password") v[k] = x;
  });
  return v;
}

// ---------- Appointments ----------
const STATUSES = ["REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;

export async function updateAppointment(_p: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser(["ADMIN", "RECEPTION", "DOCTOR"]);
  const id = str(fd, "id");
  const status = str(fd, "status") as (typeof STATUSES)[number];
  if (!STATUSES.includes(status)) return { ok: false, message: "Choose a status." };
  const time = str(fd, "confirmedTime");
  if (time && !/^\d{2}:\d{2}$/.test(time)) return { ok: false, message: "Enter a valid time." };
  const date = str(fd, "preferredDate");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, message: "Enter a valid date." };

  const [appt] = await db.select().from(appointments).where(eq(appointments.id, id));
  if (!appt) return { ok: false, message: "Appointment not found." };
  // Doctors may only change their own appointments, and can't reassign them.
  if (user.role === "DOCTOR" && appt.doctorId !== user.doctorId) {
    return { ok: false, message: "You can only update your own appointments." };
  }
  const doctorId = user.role === "DOCTOR" ? appt.doctorId : optStr(fd, "doctorId");

  const changes = {
    status,
    doctorId,
    confirmedTime: time || null,
    preferredDate: date || appt.preferredDate,
    clinicNote: optStr(fd, "clinicNote"),
  };
  await db.update(appointments).set(changes).where(eq(appointments.id, id));
  await audit(user.id, "update", "appointment", id, changes);
  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
  return { ok: true, message: "Appointment updated" };
}

// ---------- Patients ----------
const patientSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(60),
  lastName: z.string().trim().min(1, "Required").max(60),
  phone: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const n = normalizeZimPhone(v);
      if (!n) {
        ctx.addIssue({ code: "custom", message: "Enter a valid Zimbabwe number" });
        return z.NEVER;
      }
      return n;
    }),
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.email().safeParse(v).success, "Invalid email"),
  dateOfBirth: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Invalid date"),
});

function patientFields(fd: FormData) {
  return {
    email: optStr(fd, "email"),
    dateOfBirth: optStr(fd, "dateOfBirth"),
    gender: optStr(fd, "gender"),
    nationalId: optStr(fd, "nationalId"),
    bloodGroup: optStr(fd, "bloodGroup"),
    address: optStr(fd, "address"),
    allergies: optStr(fd, "allergies"),
    chronicConditions: optStr(fd, "chronicConditions"),
    emergencyContact: optStr(fd, "emergencyContact"),
  };
}

export async function createPatient(_p: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser(["ADMIN", "RECEPTION", "DOCTOR"]);
  const parsed = patientSchema.safeParse(vals(fd));
  if (!parsed.success) return { ok: false, errors: errs(parsed.error), values: vals(fd) };
  const [p] = await db
    .insert(patients)
    .values({
      patientNumber: newPatientNumber(),
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone,
      ...patientFields(fd),
    })
    .returning();
  await audit(user.id, "create", "patient", p.id);
  revalidatePath("/admin/patients");
  redirect(`/admin/patients/${p.id}?created=1`);
}

export async function updatePatient(_p: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser(["ADMIN", "RECEPTION", "DOCTOR"]);
  const id = str(fd, "id");
  const parsed = patientSchema.safeParse(vals(fd));
  if (!parsed.success) return { ok: false, errors: errs(parsed.error), values: vals(fd) };
  await db
    .update(patients)
    .set({ firstName: parsed.data.firstName, lastName: parsed.data.lastName, phone: parsed.data.phone, ...patientFields(fd) })
    .where(eq(patients.id, id));
  await audit(user.id, "update", "patient", id);
  revalidatePath(`/admin/patients/${id}`);
  return { ok: true, message: "Patient details saved" };
}

export async function deletePatient(fd: FormData) {
  const user = await requireUser(["ADMIN", "RECEPTION"]);
  const id = str(fd, "id");
  await db.update(patients).set({ deletedAt: new Date() }).where(eq(patients.id, id));
  await audit(user.id, "delete", "patient", id);
  revalidatePath("/admin/patients");
  redirect("/admin/patients?deleted=1");
}

export async function restorePatient(fd: FormData) {
  const user = await requireUser(["ADMIN"]);
  const id = str(fd, "id");
  await db.update(patients).set({ deletedAt: null }).where(eq(patients.id, id));
  await audit(user.id, "restore", "patient", id);
  revalidatePath("/admin/patients");
}

// ---------- Consultations ----------
export async function addConsultation(_p: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser(["ADMIN", "DOCTOR"]);
  const patientId = str(fd, "patientId");
  const num = (k: string) => {
    const v = str(fd, k);
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };
  const temp = num("temperatureC");
  const weight = num("weightKg");
  const pulse = num("pulse");
  const errors: Record<string, string> = {};
  if (Number.isNaN(temp) || (temp !== null && (temp < 30 || temp > 45))) errors.temperatureC = "30–45 °C";
  if (Number.isNaN(weight) || (weight !== null && (weight <= 0 || weight > 400))) errors.weightKg = "Check weight";
  if (Number.isNaN(pulse) || (pulse !== null && (pulse < 20 || pulse > 250))) errors.pulse = "20–250";
  const complaint = optStr(fd, "presentingComplaint");
  const diagnosis = optStr(fd, "diagnosis");
  const treatment = optStr(fd, "treatment");
  if (!complaint && !diagnosis && !treatment) errors.presentingComplaint = "Add a complaint, diagnosis or treatment";
  if (Object.keys(errors).length) return { ok: false, errors, values: vals(fd) };

  const doctorId = user.doctorId ?? (optStr(fd, "doctorId") || null);
  const [c] = await db
    .insert(consultations)
    .values({
      patientId,
      doctorId,
      appointmentId: optStr(fd, "appointmentId"),
      presentingComplaint: complaint,
      bp: optStr(fd, "bp"),
      temperatureC: temp === null ? null : String(temp),
      weightKg: weight === null ? null : String(weight),
      pulse: pulse === null ? null : Math.round(pulse),
      clinicalNotes: optStr(fd, "clinicalNotes"),
      diagnosis,
      treatment,
      followUpDate: optStr(fd, "followUpDate"),
    })
    .returning();
  const medicine = optStr(fd, "medicine");
  if (medicine) {
    await db.insert(prescriptions).values({
      consultationId: c.id,
      medicine,
      dosage: optStr(fd, "dosage"),
      frequency: optStr(fd, "frequency"),
      duration: optStr(fd, "duration"),
      instructions: optStr(fd, "instructions"),
    });
  }
  const apptId = optStr(fd, "appointmentId");
  if (apptId) await db.update(appointments).set({ status: "COMPLETED" }).where(eq(appointments.id, apptId));
  await audit(user.id, "create", "consultation", c.id, { patientId });
  revalidatePath(`/admin/patients/${patientId}`);
  return { ok: true, message: "Consultation saved" };
}

// ---------- Doctors ----------
export async function createDoctor(_p: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireUser(["ADMIN"]);
  const v = vals(fd);
  const fullName = str(fd, "fullName");
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const errors: Record<string, string> = {};
  if (!fullName) errors.fullName = "Required";
  if (email && !z.email().safeParse(email).success) errors.email = "Invalid email";
  if (email && password.length < 8) errors.password = "At least 8 characters";
  if (!email && password) errors.email = "Add a login email for the password";
  if (email) {
    const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (exists) errors.email = "This email already has a login";
  }
  if (Object.keys(errors).length) return { ok: false, errors, values: v };

  let userId: string | null = null;
  if (email) {
    const [u] = await db
      .insert(users)
      .values({ email, name: fullName, role: "DOCTOR", passwordHash: await bcrypt.hash(password, 12) })
      .returning();
    userId = u.id;
  }
  const [d] = await db
    .insert(doctors)
    .values({
      fullName,
      specialty: str(fd, "specialty") || "Dental Surgeon",
      qualifications: optStr(fd, "qualifications"),
      bio: optStr(fd, "bio"),
      phone: optStr(fd, "phone"),
      email: optStr(fd, "publicEmail"),
      branchId: optStr(fd, "branchId"),
      userId,
    })
    .returning();
  const serviceIds = fd.getAll("serviceIds").map(String).filter(Boolean);
  if (serviceIds.length) await db.insert(doctorServices).values(serviceIds.map((serviceId) => ({ doctorId: d.id, serviceId })));
  await audit(admin.id, "create", "doctor", d.id);
  revalidatePath("/admin/doctors");
  return { ok: true, message: `${fullName} added` };
}

export async function updateDoctor(_p: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireUser(["ADMIN"]);
  const id = str(fd, "id");
  const fullName = str(fd, "fullName");
  if (!fullName) return { ok: false, errors: { fullName: "Required" } };
  const [doc] = await db.select().from(doctors).where(eq(doctors.id, id));
  if (!doc) return { ok: false, message: "Doctor not found" };

  await db
    .update(doctors)
    .set({
      fullName,
      specialty: str(fd, "specialty") || "Dental Surgeon",
      qualifications: optStr(fd, "qualifications"),
      bio: optStr(fd, "bio"),
      phone: optStr(fd, "phone"),
      email: optStr(fd, "publicEmail"),
      branchId: optStr(fd, "branchId"),
      active: fd.get("active") === "on",
    })
    .where(eq(doctors.id, id));
  await db.delete(doctorServices).where(eq(doctorServices.doctorId, id));
  const serviceIds = fd.getAll("serviceIds").map(String).filter(Boolean);
  if (serviceIds.length) await db.insert(doctorServices).values(serviceIds.map((serviceId) => ({ doctorId: id, serviceId })));

  // Portal login: create one, or reset the password.
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (password && password.length < 8) return { ok: false, errors: { password: "At least 8 characters" } };
  if (doc.userId) {
    const set: Partial<typeof users.$inferInsert> = { name: fullName, active: fd.get("active") === "on" };
    if (password) set.passwordHash = await bcrypt.hash(password, 12);
    await db.update(users).set(set).where(eq(users.id, doc.userId));
  } else if (email && password) {
    const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (exists) return { ok: false, errors: { email: "This email already has a login" } };
    const [u] = await db
      .insert(users)
      .values({ email, name: fullName, role: "DOCTOR", passwordHash: await bcrypt.hash(password, 12) })
      .returning();
    await db.update(doctors).set({ userId: u.id }).where(eq(doctors.id, id));
  }
  await audit(admin.id, "update", "doctor", id);
  revalidatePath("/admin/doctors");
  return { ok: true, message: "Doctor saved" };
}

export async function deleteDoctor(fd: FormData) {
  const admin = await requireUser(["ADMIN"]);
  const id = str(fd, "id");
  const [doc] = await db.select().from(doctors).where(eq(doctors.id, id));
  if (!doc) return;
  await db.update(doctors).set({ deletedAt: new Date(), active: false }).where(eq(doctors.id, id));
  if (doc.userId) await db.update(users).set({ active: false }).where(eq(users.id, doc.userId));
  await audit(admin.id, "delete", "doctor", id);
  revalidatePath("/admin/doctors");
}

export async function restoreDoctor(fd: FormData) {
  const admin = await requireUser(["ADMIN"]);
  const id = str(fd, "id");
  await db.update(doctors).set({ deletedAt: null, active: true }).where(eq(doctors.id, id));
  await audit(admin.id, "restore", "doctor", id);
  revalidatePath("/admin/doctors");
}

// ---------- Services ----------
const serviceSchema = z.object({
  name: z.string().trim().min(1, "Required").max(80),
  shortDescription: z.string().trim().min(1, "Required").max(200),
});

export async function saveService(_p: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireUser(["ADMIN"]);
  const parsed = serviceSchema.safeParse(vals(fd));
  if (!parsed.success) return { ok: false, errors: errs(parsed.error), values: vals(fd) };
  const id = str(fd, "id");
  const data = {
    ...parsed.data,
    fullDescription: optStr(fd, "fullDescription"),
    price: optStr(fd, "price"),
  };
  if (id) {
    await db.update(services).set({ ...data, active: fd.get("active") === "on" }).where(eq(services.id, id));
    await audit(admin.id, "update", "service", id);
  } else {
    const [last] = await db.select().from(services).orderBy(desc(services.sortOrder)).limit(1);
    const [s] = await db.insert(services).values({ ...data, sortOrder: (last?.sortOrder ?? -1) + 1 }).returning();
    await audit(admin.id, "create", "service", s.id);
  }
  revalidatePath("/admin/services");
  return { ok: true, message: id ? "Service saved" : "Service added" };
}

export async function moveService(fd: FormData) {
  await requireUser(["ADMIN"]);
  const id = str(fd, "id");
  const dir = str(fd, "dir");
  const [cur] = await db.select().from(services).where(eq(services.id, id));
  if (!cur) return;
  const [other] = await db
    .select()
    .from(services)
    .where(and(ne(services.id, id), dir === "up" ? lt(services.sortOrder, cur.sortOrder) : gt(services.sortOrder, cur.sortOrder)))
    .orderBy(dir === "up" ? desc(services.sortOrder) : asc(services.sortOrder))
    .limit(1);
  if (!other) return;
  await db.update(services).set({ sortOrder: other.sortOrder }).where(eq(services.id, cur.id));
  await db.update(services).set({ sortOrder: cur.sortOrder }).where(eq(services.id, other.id));
  revalidatePath("/admin/services");
}

// ---------- Feedback ----------
export async function saveFeedback(fd: FormData) {
  const admin = await requireUser(["ADMIN"]);
  const id = str(fd, "id");
  const published = fd.get("published") === "on";
  const reviewed = fd.get("reviewed") === "on" || published;
  await db.update(feedback).set({ reviewed, published }).where(eq(feedback.id, id));
  await audit(admin.id, "update", "feedback", id, { reviewed, published });
  revalidatePath("/admin/feedback");
  redirect("/admin/feedback?saved=1");
}

export async function deleteFeedback(fd: FormData) {
  const admin = await requireUser(["ADMIN"]);
  const id = str(fd, "id");
  await db.delete(feedback).where(eq(feedback.id, id));
  await audit(admin.id, "delete", "feedback", id);
  revalidatePath("/admin/feedback");
  redirect("/admin/feedback?deleted=1");
}

// ---------- Website CMS ----------
const urlOrEmpty = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^https?:\/\/\S+$/.test(v), "Start with https://");

const settingsSchema = z.object({
  clinicName: z.string().trim().min(1, "Required"),
  phone: z.string().trim().min(1, "Required"),
  email: z.email("Invalid email"),
  address: z.string().trim().min(1, "Required"),
  openingHours: z.string().trim().min(1, "Required"),
  emergencyMessage: z.string().trim().min(1, "Required"),
  medicalAids: z.string().trim().min(1, "Required"),
  heroMessage: z.string().trim().min(1, "Required").max(300),
  aboutText: z.string().trim().min(1, "Required").max(800),
  whatsappNumber: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => /^263\d{9}$/.test(v), "Use international format, e.g. 263783397863"),
  mapQuery: z.string().trim().optional(),
  emergencyPhone: z.string().trim().max(40).optional(),
  facebookUrl: urlOrEmpty,
  instagramUrl: urlOrEmpty,
  linkedinUrl: urlOrEmpty,
  tiktokUrl: urlOrEmpty,
  youtubeUrl: urlOrEmpty,
});

export async function saveSettings(_p: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireUser(["ADMIN"]);
  const parsed = settingsSchema.safeParse(vals(fd));
  if (!parsed.success) return { ok: false, errors: errs(parsed.error), values: vals(fd) };
  const d = Object.fromEntries(
    Object.entries(parsed.data).map(([k, v]) => [k, v === "" ? null : v]),
  ) as typeof parsed.data;
  await db
    .insert(siteSettings)
    .values({ id: 1, ...d })
    .onConflictDoUpdate({ target: siteSettings.id, set: d });
  await audit(admin.id, "update", "settings", "1");
  revalidatePath("/", "layout");
  return { ok: true, message: "Website settings saved" };
}

// ---------- Account & staff ----------
export async function changePassword(_p: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  const [row] = await db.select().from(users).where(eq(users.id, user.id));
  if (!row || !(await bcrypt.compare(current, row.passwordHash))) return { ok: false, errors: { current: "Incorrect password" } };
  if (next.length < 8) return { ok: false, errors: { next: "At least 8 characters" } };
  if (next !== confirm) return { ok: false, errors: { confirm: "Passwords don't match" } };
  await db.update(users).set({ passwordHash: await bcrypt.hash(next, 12), passwordChangedAt: new Date() }).where(eq(users.id, user.id));
  await audit(user.id, "password_change", "user", user.id);
  return { ok: true, message: "Password changed" };
}

export async function createStaff(_p: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireUser(["ADMIN"]);
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const role = str(fd, "role") === "ADMIN" ? "ADMIN" : "RECEPTION";
  const errors: Record<string, string> = {};
  if (!name) errors.name = "Required";
  if (!z.email().safeParse(email).success) errors.email = "Invalid email";
  if (password.length < 8) errors.password = "At least 8 characters";
  const [exists] = email ? await db.select({ id: users.id }).from(users).where(eq(users.email, email)) : [];
  if (exists) errors.email = "This email already has a login";
  if (Object.keys(errors).length) return { ok: false, errors, values: vals(fd) };
  const [u] = await db.insert(users).values({ name, email, role, passwordHash: await bcrypt.hash(password, 12) }).returning();
  await audit(admin.id, "create", "user", u.id, { role });
  revalidatePath("/admin/account");
  return { ok: true, message: `${name} can now sign in` };
}

export async function toggleStaff(fd: FormData) {
  const admin = await requireUser(["ADMIN"]);
  const id = str(fd, "id");
  if (id === admin.id) return;
  const [u] = await db.select().from(users).where(eq(users.id, id));
  if (!u) return;
  await db.update(users).set({ active: !u.active }).where(eq(users.id, id));
  await audit(admin.id, u.active ? "deactivate" : "activate", "user", id);
  revalidatePath("/admin/account");
}
