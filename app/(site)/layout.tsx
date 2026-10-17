import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSettings } from "@/lib/settings";

// Content comes from the admin CMS, so pages render on request.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const emergencyTel = "+263" + s.phone.split("/")[0].replace(/\D/g, "").replace(/^0/, "");
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
          <span className="text-white/40" aria-hidden>·</span>
          <a href={`tel:${emergencyTel}`} className="font-medium text-accent-100 underline-offset-2 hover:underline">
            Call {s.phone.split("/")[0].trim()}
          </a>
        </div>
      </div>
      <SiteHeader clinicName={s.clinicName} />
      <main id="main">{children}</main>
      <SiteFooter s={s} />
    </>
  );
}
