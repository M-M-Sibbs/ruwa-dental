import type { MetadataRoute } from "next";
import { SITE_URL, slugify } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/emergency-dentist`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/book-appointment`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/medical-aids`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/track-booking`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
  try {
    const { getActiveServices } = await import("@/lib/services");
    for (const svc of await getActiveServices()) {
      pages.push({
        url: `${SITE_URL}/services/${slugify(svc.name)}`,
        lastModified: svc.updatedAt,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  } catch {
    // Database unavailable: still serve the main pages.
  }
  return pages;
}
