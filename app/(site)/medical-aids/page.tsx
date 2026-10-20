import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { emergencyPhone, splitList, telHref } from "@/lib/site";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { Arrow, Check, Plus } from "@/components/Icons";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const aids = splitList(s.medicalAids);
  return {
    title: "Medical Aids Accepted — Dentist in Ruwa",
    description: `Ruwa Dental Center accepts ${aids.join(", ")}. Use your medical aid for dental check-ups, fillings, extractions and more in Ruwa, Zimbabwe.`,
    alternates: { canonical: "/medical-aids" },
  };
}

export default async function MedicalAidsPage() {
  const s = await getSettings();
  const aids = splitList(s.medicalAids);
  const emergency = emergencyPhone(s);
  const faqs = [
    {
      q: "Can I use my medical aid at Ruwa Dental Center?",
      a: `Yes. We accept ${aids.join(", ")}. Bring your medical aid card and ID to your appointment.`,
    },
    {
      q: "Will my medical aid cover the full cost of treatment?",
      a: "Cover depends on your medical aid and plan. Contact the clinic before your visit and we will help you confirm what is covered and whether there is a shortfall.",
    },
    {
      q: "What if my medical aid isn't listed?",
      a: "Call or WhatsApp the clinic. We can advise on your options, and you can still be treated as a private patient.",
    },
  ];

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Medical aids", path: "/medical-aids" }])} />
      <PageHero
        eyebrow="Medical aids"
        title="Medical aids accepted at our Ruwa dental clinic"
        intro={<>Use your medical aid for dental care at {s.clinicName}, {s.address}. Please contact the clinic to confirm your cover and any applicable terms before your visit.</>}
        crumbs={[{ name: "Home", href: "/" }, { name: "Medical aids" }]}
      />

      <section className="pb-16">
        <div className="container-x">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aids.map((a) => (
              <li key={a} className="card flex items-center gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                  <Plus className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-lg font-semibold tracking-tight">{a}</span>
                  <span className="text-sm text-muted">Accepted</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="h-display text-3xl">Using your medical aid</h2>
            <ul className="mt-6 space-y-3">
              {[
                "Bring your medical aid card and ID to every visit",
                "Ask us to confirm your cover before treatment",
                "We'll explain any shortfall before we begin",
                "Emergency care is available 24 hours",
              ].map((t) => (
                <li key={t} className="flex gap-3 text-ink/85">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book-appointment" className="btn-primary">Book an appointment <Arrow /></Link>
              <a href={telHref(emergency)} className="btn-soft">Call {emergency}</a>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Medical aid questions</h2>
            <div className="mt-5 divide-y divide-line rounded-2xl border border-line bg-white">
              {faqs.map((f) => (
                <div key={f.q} className="px-5 py-4">
                  <h3 className="font-semibold">{f.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
