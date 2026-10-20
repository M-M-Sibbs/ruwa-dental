import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { emergencyPhone, telHref } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { Phone, WhatsApp } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Emergency Dentist in Ruwa — Open 24 Hours",
  description:
    "Toothache, swelling, a broken or knocked-out tooth? Ruwa Dental Center is open 24 hours for dental emergencies in Ruwa, Zimbabwe. Call or WhatsApp now.",
  alternates: { canonical: "/emergency-dentist" },
};

const EMERGENCIES = [
  { t: "Severe toothache", d: "Throbbing or constant pain, often from decay or infection." },
  { t: "Swelling in the face or gums", d: "May mean an abscess or infection that needs prompt treatment." },
  { t: "Knocked-out tooth", d: "The sooner you are seen, the better the chance of saving it." },
  { t: "Broken, cracked or chipped tooth", d: "Especially if it is sharp, painful or bleeding." },
  { t: "Bleeding after an extraction", d: "Bleeding that won't stop with firm pressure." },
  { t: "Lost filling or crown", d: "Exposed teeth can be sensitive and break further." },
];

export default async function EmergencyPage() {
  const s = await getSettings();
  const emergency = emergencyPhone(s);
  const faqs = [
    {
      q: "Is there an emergency dentist in Ruwa?",
      a: `Yes. ${s.clinicName} at ${s.address} is open 24 hours for dental emergencies. Call or WhatsApp ${emergency}.`,
    },
    {
      q: "What should I do if a tooth is knocked out?",
      a: "Pick it up by the top (the crown), not the root. If it is dirty, rinse it briefly in milk or clean water. Keep it in milk or inside your cheek, and see a dentist straight away.",
    },
    {
      q: "When should I go to hospital instead?",
      a: "Go to the nearest hospital emergency department if you have swelling that affects your breathing or swallowing, a high fever with facial swelling, or a serious injury to the head or jaw.",
    },
  ];

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Emergency dentist", path: "/emergency-dentist" }])} />
      <PageHero
        eyebrow="Dental emergencies • Open 24 hours"
        title="Emergency dentist in Ruwa, open 24 hours"
        intro={<>Dental pain can&apos;t always wait. {s.clinicName} sees emergency patients day and night, every day of the week. Call or WhatsApp our emergency line and tell us what happened.</>}
        crumbs={[{ name: "Home", href: "/" }, { name: "Emergency dentist" }]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={telHref(emergency)} className="btn bg-danger px-6 py-3.5 text-white hover:bg-[#a82e25]">
            <Phone /> Call {emergency}
          </a>
          <a
            href={waLink(emergency, `Hello ${s.clinicName}, I have a dental emergency.`)}
            target="_blank"
            rel="noopener"
            className="btn bg-[#25D366] px-6 py-3.5 text-white hover:bg-[#1fb958]"
          >
            <WhatsApp /> WhatsApp the dentist
          </a>
        </div>
      </PageHero>

      <section className="py-16">
        <div className="container-x">
          <h2 className="h-display text-3xl">We treat urgent dental problems</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EMERGENCIES.map((e) => (
              <li key={e.t} className="card p-5">
                <h3 className="font-semibold">{e.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{e.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="container-x max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight">Emergency questions</h2>
          <div className="mt-5 divide-y divide-line rounded-2xl border border-line bg-white">
            {faqs.map((f) => (
              <div key={f.q} className="px-5 py-4">
                <h3 className="font-semibold">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted">
            Not an emergency? <Link href="/book-appointment" className="link">Book an appointment online</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
