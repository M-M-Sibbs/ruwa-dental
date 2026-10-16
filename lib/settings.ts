import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db, siteSettings, type Settings } from "@/db";

const FALLBACK: Settings = {
  id: 1,
  clinicName: "Ruwa Dental Center",
  phone: "078 339 7863 / 0783 193 895",
  email: "info@ruwadental.co.zw",
  address: "1780 Runyararo Road, Ruwa",
  openingHours: "Every day, 8AM to 6PM",
  emergencyMessage: "Always open for emergencies",
  medicalAids: "CIMAS, First Mutual, Alliance, MASCA and FBC",
  heroMessage: "Your gateway to healthy smiles — professional dental care for the whole family.",
  aboutText:
    "We provide patient-centred dental care with a focus on comfort, clear communication and continuity.",
  whatsappNumber: "263783397863",
  mapQuery: "1780 Runyararo Road, Ruwa, Zimbabwe",
  facebookUrl: "https://www.facebook.com/share/1JhMVQYnHz/",
  instagramUrl: null,
  linkedinUrl: null,
  tiktokUrl: null,
  youtubeUrl: null,
  createdAt: new Date(0),
  updatedAt: new Date(0),
};

export const getSettings = cache(async (): Promise<Settings> => {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
  return row ?? FALLBACK;
});
