import type { Settings } from "@/db/schema";

/** Public address of the site, used for canonical links, sitemap and structured data. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.ruwadental.site").replace(/\/$/, "");

/** "078 339 7863 / 0783 193 895" → "078 339 7863" */
export const firstPhone = (phones: string) => phones.split("/")[0].trim();

/** Local number → international digits, e.g. "0783 193 895" → "263783193895". */
export function intlDigits(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("263")) return d;
  return "263" + d.replace(/^0/, "");
}

export const telHref = (phone: string) => `tel:+${intlDigits(phone)}`;

/** The emergency line, falling back to the main phone. */
export const emergencyPhone = (s: Settings) => s.emergencyPhone?.trim() || firstPhone(s.phone);

/** "CIMAS, First Mutual and FBC" → ["CIMAS", "First Mutual", "FBC"] */
export function splitList(text: string) {
  return text
    .split(/,|\band\b|\n/i)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Neighbourhoods near the clinic, used in local search content. */
export const AREAS_SERVED = [
  "Ruwa",
  "Zimre Park",
  "Damofalls",
  "Windsor Park",
  "Chipukutu",
  "Mabvuku",
  "Tafara",
  "Greendale",
  "Harare East",
];
