// Ruwa Dental Center — database schema (Drizzle ORM, Postgres)
import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

export const roleEnum = pgEnum("role", ["ADMIN", "DOCTOR", "RECEPTION"]);
export const statusEnum = pgEnum("appointment_status", [
  "REQUESTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("ADMIN"),
  active: boolean("active").notNull().default(true),
  // Set when the person changes their own password in Admin → Account.
  passwordChangedAt: timestamp("password_changed_at", { withTimezone: true }),
  ...timestamps,
});

export const branches = pgTable("branches", {
  id: id(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  ...timestamps,
});

export const doctors = pgTable("doctors", {
  id: id(),
  fullName: text("full_name").notNull(),
  specialty: text("specialty").notNull().default("Dental Surgeon"),
  qualifications: text("qualifications"),
  bio: text("bio"),
  phone: text("phone"),
  // Public contact email shown on the website's doctor card (separate from the login).
  email: text("email"),
  active: boolean("active").notNull().default(true),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  userId: text("user_id")
    .unique()
    .references(() => users.id),
  branchId: text("branch_id").references(() => branches.id),
  ...timestamps,
});

export const services = pgTable("services", {
  id: id(),
  name: text("name").notNull(),
  shortDescription: text("short_description").notNull(),
  fullDescription: text("full_description"),
  price: text("price"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

export const doctorServices = pgTable(
  "doctor_services",
  {
    doctorId: text("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.doctorId, t.serviceId] })],
);

export const patients = pgTable(
  "patients",
  {
    id: id(),
    patientNumber: text("patient_number").notNull().unique(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    dateOfBirth: date("date_of_birth"),
    gender: text("gender"),
    nationalId: text("national_id"),
    bloodGroup: text("blood_group"),
    address: text("address"),
    allergies: text("allergies"),
    chronicConditions: text("chronic_conditions"),
    emergencyContact: text("emergency_contact"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("patients_phone_idx").on(t.phone)],
);

export const appointments = pgTable(
  "appointments",
  {
    id: id(),
    trackingCode: text("tracking_code").notNull().unique(),
    preferredDate: date("preferred_date").notNull(),
    preferredTime: text("preferred_time").notNull(),
    confirmedTime: text("confirmed_time"),
    status: statusEnum("status").notNull().default("REQUESTED"),
    reason: text("reason"),
    clinicNote: text("clinic_note"),
    whatsappNotifiedAt: timestamp("whatsapp_notified_at", { withTimezone: true }),
    patientId: text("patient_id")
      .notNull()
      .references(() => patients.id),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id),
    doctorId: text("doctor_id").references(() => doctors.id),
    branchId: text("branch_id").references(() => branches.id),
    ...timestamps,
  },
  (t) => [
    index("appointments_status_idx").on(t.status),
    index("appointments_date_idx").on(t.preferredDate),
  ],
);

export const consultations = pgTable("consultations", {
  id: id(),
  date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
  presentingComplaint: text("presenting_complaint"),
  bp: text("bp"),
  temperatureC: numeric("temperature_c", { precision: 4, scale: 1 }),
  weightKg: numeric("weight_kg", { precision: 5, scale: 1 }),
  pulse: integer("pulse"),
  clinicalNotes: text("clinical_notes"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  followUpDate: date("follow_up_date"),
  patientId: text("patient_id")
    .notNull()
    .references(() => patients.id),
  doctorId: text("doctor_id").references(() => doctors.id),
  appointmentId: text("appointment_id").references(() => appointments.id),
  ...timestamps,
});

export const prescriptions = pgTable("prescriptions", {
  id: id(),
  medicine: text("medicine").notNull(),
  dosage: text("dosage"),
  frequency: text("frequency"),
  duration: text("duration"),
  instructions: text("instructions"),
  consultationId: text("consultation_id")
    .notNull()
    .references(() => consultations.id, { onDelete: "cascade" }),
  ...timestamps,
});

export const feedback = pgTable("feedback", {
  id: id(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  rating: integer("rating").notNull(),
  message: text("message").notNull(),
  reviewed: boolean("reviewed").notNull().default(false),
  published: boolean("published").notNull().default(false),
  ...timestamps,
});

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  clinicName: text("clinic_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  openingHours: text("opening_hours").notNull(),
  emergencyMessage: text("emergency_message").notNull(),
  medicalAids: text("medical_aids").notNull(),
  heroMessage: text("hero_message").notNull(),
  aboutText: text("about_text").notNull(),
  whatsappNumber: text("whatsapp_number").notNull(),
  // Emergency line, also used by the floating "Chat on WhatsApp" button.
  emergencyPhone: text("emergency_phone"),
  mapQuery: text("map_query"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  linkedinUrl: text("linkedin_url"),
  tiktokUrl: text("tiktok_url"),
  youtubeUrl: text("youtube_url"),
  ...timestamps,
});

// Who changed what (privacy requirement)
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: id(),
    userId: text("user_id").references(() => users.id),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id").notNull(),
    details: text("details"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("audit_entity_idx").on(t.entity, t.entityId)],
);

// ---- Relations ----
export const usersRelations = relations(users, ({ one }) => ({
  doctor: one(doctors, { fields: [users.id], references: [doctors.userId] }),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, { fields: [doctors.userId], references: [users.id] }),
  branch: one(branches, { fields: [doctors.branchId], references: [branches.id] }),
  doctorServices: many(doctorServices),
  appointments: many(appointments),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  doctorServices: many(doctorServices),
}));

export const doctorServicesRelations = relations(doctorServices, ({ one }) => ({
  doctor: one(doctors, { fields: [doctorServices.doctorId], references: [doctors.id] }),
  service: one(services, { fields: [doctorServices.serviceId], references: [services.id] }),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  consultations: many(consultations),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
  service: one(services, { fields: [appointments.serviceId], references: [services.id] }),
  doctor: one(doctors, { fields: [appointments.doctorId], references: [doctors.id] }),
  branch: one(branches, { fields: [appointments.branchId], references: [branches.id] }),
}));

export const consultationsRelations = relations(consultations, ({ one, many }) => ({
  patient: one(patients, { fields: [consultations.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [consultations.doctorId], references: [doctors.id] }),
  prescriptions: many(prescriptions),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  consultation: one(consultations, {
    fields: [prescriptions.consultationId],
    references: [consultations.id],
  }),
}));

export type Settings = typeof siteSettings.$inferSelect;
export type AppointmentStatus = (typeof statusEnum.enumValues)[number];
export type Role = (typeof roleEnum.enumValues)[number];
