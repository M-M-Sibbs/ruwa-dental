import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { getSettings } from "@/lib/settings";
import { asc, eq } from "drizzle-orm";
import { db, services } from "@/db";
import { emergencyPhone, telHref } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";

// Content comes from the admin CMS, so pages render on request.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const serviceNames = (
    await db.select({ name: services.name }).from(services).where(eq(services.active, true)).orderBy(asc(services.sortOrder))
  ).map((x) => x.name);
  const emergency = emergencyPhone(s);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <div className="bg-navy-900 text-white">
        <div className="container-x flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center text-xs sm:text-sm">
          <span className="inline-flex items-center gap-2 font-semibold">
            <span className="h-2 w-2 rounded-full bg-red-400" aria-hidden />
            {s.emergencyMessage}
          </span>
          <span className="hidden text-white/40 sm:inline" aria-hidden>·</span>
          <a href={telHref(emergency)} className="font-medium text-accent-100 underline-offset-2 hover:underline">
            Emergency line: {emergency}
          </a>
        </div>
      </div>
      <SiteHeader clinicName={s.clinicName} />
      <main id="main">{children}</main>
      <SiteFooter s={s} services={serviceNames} />
      <FloatingWhatsApp href={waLink(emergency, `Hello ${s.clinicName}, I would like to speak to the dentist.`)} />
    </>
  );
}
