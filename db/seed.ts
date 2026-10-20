// Starting content: settings, branch, services, the principal dentist and the
// first administrator login. Safe to run more than once.
import bcrypt from "bcryptjs";
import { and, eq, ilike, isNull } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const servicesSeed = [
  { name: "Full Exams & X-Ray", shortDescription: "Comprehensive dental examinations and diagnostic X-rays." },
  { name: "Dental Cleaning", shortDescription: "Professional cleaning to remove plaque and tartar and support healthy gums." },
  {
    name: "Fillings, Root Canals & Extraction",
    shortDescription: "Restorative and pain-relief treatment including fillings, root canal therapy and extractions.",
  },
  { name: "Full and Partial Dentures", shortDescription: "Custom full and partial dentures designed to restore function and confidence." },
  { name: "Crowns & Bridges", shortDescription: "Dental crowns and bridges to restore damaged or missing teeth." },
  { name: "Dental Implants", shortDescription: "Implant-based tooth replacement planning and care." },
];

/** Removes spaces and surrounding quotes people often paste into Vercel settings. */
function clean(v: string | undefined) {
  return (v ?? "").trim().replace(/^(["'])(.*)\1$/, "$2").trim();
}

export async function seedDatabase(db: NodePgDatabase<typeof schema>) {
  const { siteSettings, branches, services, users, doctors, doctorServices } = schema;

  await db
    .insert(siteSettings)
    .values({
      id: 1,
      clinicName: "Ruwa Dental Center",
      phone: "078 339 7863 / 0783 193 895",
      email: "info@ruwadental.co.zw",
      address: "1780 Runyararo Road, Ruwa",
      openingHours: "Open 24 hours, every day",
      emergencyMessage: "Open 24 hours for emergencies",
      medicalAids: "CIMAS, First Mutual, Alliance, MASCA, FBC, Bonvie, PSMAS, Quest, CALM and Maisha",
      heroMessage: "Your gateway to healthy smiles — professional dental care for the whole family.",
      aboutText:
        "We provide patient-centred dental care with a focus on comfort, clear communication and continuity. Your previous visits, treatments and prescriptions are kept securely in your clinic record for future care.",
      whatsappNumber: "263783397863",
      emergencyPhone: "0783 193 895",
      mapQuery: "1780 Runyararo Road, Ruwa, Zimbabwe",
      facebookUrl: "https://www.facebook.com/share/1JhMVQYnHz/",
    })
    .onConflictDoNothing();

  // Sites set up before the 24-hour emergency wording get it on their next deploy
  // (only if the clinic hasn't written its own message in the Website CMS).
  await db
    .update(siteSettings)
    .set({ emergencyMessage: "Open 24 hours for emergencies" })
    .where(eq(siteSettings.emergencyMessage, "Always open for emergencies"));

  // Earlier sites showed 8AM–6PM; the clinic is now open 24 hours.
  await db
    .update(siteSettings)
    .set({ openingHours: "Open 24 hours, every day" })
    .where(eq(siteSettings.openingHours, "Every day, 8AM to 6PM"));

  // Newer details for sites set up earlier (only where the clinic hasn't edited them).
  await db
    .update(siteSettings)
    .set({ medicalAids: "CIMAS, First Mutual, Alliance, MASCA, FBC, Bonvie, PSMAS, Quest, CALM and Maisha" })
    .where(eq(siteSettings.medicalAids, "CIMAS, First Mutual, Alliance, MASCA and FBC"));
  await db.update(siteSettings).set({ emergencyPhone: "0783 193 895" }).where(isNull(siteSettings.emergencyPhone));

  let [branch] = await db.select().from(branches).limit(1);
  if (!branch) {
    [branch] = await db.insert(branches).values({ name: "Ruwa Dental Center", address: "1780 Runyararo Road, Ruwa" }).returning();
  }

  if ((await db.select({ id: services.id }).from(services)).length === 0) {
    await db.insert(services).values(servicesSeed.map((s, i) => ({ ...s, sortOrder: i })));
  }

  const adminEmail = clean(process.env.SEED_ADMIN_EMAIL).toLowerCase() || "admin@ruwadental.co.zw";
  const adminPassword = clean(process.env.SEED_ADMIN_PASSWORD) || "ChangeMe!2026";
  const [admin] = await db.select().from(users).where(eq(users.email, adminEmail));
  if (!admin) {
    await db.insert(users).values({
      email: adminEmail,
      name: "Ruwa Dental Administrator",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(adminPassword, 12),
    });
  } else if (!admin.passwordChangedAt && !(await bcrypt.compare(adminPassword, admin.passwordHash))) {
    // Until the admin sets their own password in Admin → Account, the login
    // follows SEED_ADMIN_PASSWORD, so changing it in Vercel and redeploying works.
    await db
      .update(users)
      .set({ passwordHash: await bcrypt.hash(adminPassword, 12), active: true })
      .where(eq(users.id, admin.id));
  }

  if ((await db.select({ id: doctors.id }).from(doctors)).length === 0) {
    const [doc] = await db
      .insert(doctors)
      .values({
        fullName: "Dr Tapiwa Gwenhamo",
        specialty: "Dental Surgeon",
        qualifications: "BDS (UZ)",
        email: "tapiwagwenhamo2023@gmail.com",
        branchId: branch.id,
      })
      .returning();
    const all = await db.select({ id: services.id }).from(services);
    if (all.length) await db.insert(doctorServices).values(all.map((s) => ({ doctorId: doc.id, serviceId: s.id })));
  }
  // Add Dr Gwenhamo's contact email on sites created before it was known.
  await db
    .update(doctors)
    .set({ email: "tapiwagwenhamo2023@gmail.com" })
    .where(and(ilike(doctors.fullName, "%Gwenhamo%"), isNull(doctors.email)));

  return adminEmail;
}
