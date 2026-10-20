import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { getActiveServices, getServiceBySlug } from "@/lib/services";
import { SERVICE_COPY, genericCopy } from "@/lib/service-content";
import { SITE_URL, emergencyPhone, slugify, telHref } from "@/lib/site";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/structured-data";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { Arrow, Check, Phone } from "@/components/Icons";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const svc = await getServiceBySlug(slug);
  if (!svc) return {};
  return {
    title: `${svc.name} in Ruwa`,
    description: `${svc.shortDescription} ${svc.name} at Ruwa Dental Center, 1780 Runyararo Road, Ruwa. Open 24 hours. Book online or WhatsApp.`.slice(0, 300),
    alternates: { canonical: `/services/${slug}` },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [svc, all, s] = await Promise.all([getServiceBySlug(slug), getActiveServices(), getSettings()]);
  if (!svc) notFound();
  const copy = SERVICE_COPY[slug] ?? genericCopy(svc.name, svc.shortDescription);
  const emergency = emergencyPhone(s);
  const others = all.filter((x) => x.id !== svc.id);

  const procedure = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: svc.name,
    description: svc.fullDescription || copy.intro,
    url: `${SITE_URL}/services/${slug}`,
    procedureType: "https://schema.org/TherapeuticProcedure",
    provider: { "@id": `${SITE_URL}/#clinic` },
  };

  return (
    <>
      <JsonLd data={procedure} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/#services" },
          { name: svc.name, path: `/services/${slug}` },
        ])}
      />
      {copy.faqs.length > 0 && <JsonLd data={faqJsonLd(copy.faqs)} />}

      <PageHero
        eyebrow="Dental services in Ruwa"
        title={<>{svc.name} in Ruwa</>}
        intro={svc.fullDescription || copy.intro}
        crumbs={[{ name: "Home", href: "/" }, { name: "Services", href: "/#services" }, { name: svc.name }]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/book-appointment?service=${svc.id}`} className="btn-primary px-6 py-3.5">
            Book an appointment <Arrow />
          </Link>
          <a href={telHref(emergency)} className="btn-soft px-6 py-3.5">
            <Phone className="h-4 w-4" /> In pain? Call {emergency}
          </a>
        </div>
        {svc.price && <p className="mt-4 text-sm font-semibold text-ink">From {svc.price}</p>}
      </PageHero>

      <section className="py-16">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="h-display text-3xl">What to expect</h2>
            <ul className="mt-6 space-y-3">
              {copy.whatToExpect.map((t) => (
                <li key={t} className="flex gap-3 text-ink/85">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-bold tracking-tight">Who it helps</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {copy.goodFor.map((g) => (
                <li key={g} className="rounded-full bg-accent-50 px-3 py-1 text-sm font-medium text-accent-700">{g}</li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-muted">
              {s.clinicName} is at {s.address} and is open 24 hours. We accept most medical aids, including{" "}
              {s.medicalAids}. <Link href="/medical-aids" className="link">See medical aids</Link>.
            </p>
          </div>
        </div>
      </section>

      {copy.faqs.length > 0 && (
        <section className="bg-surface py-16">
          <div className="container-x max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight">{svc.name}: common questions</h2>
            <div className="mt-5 divide-y divide-line rounded-2xl border border-line bg-white">
              {copy.faqs.map((f) => (
                <div key={f.q} className="px-5 py-4">
                  <h3 className="font-semibold">{f.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="py-16">
          <div className="container-x">
            <h2 className="text-2xl font-bold tracking-tight">Other dental services in Ruwa</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => (
                <li key={o.id}>
                  <Link href={`/services/${slugify(o.name)}`} className="card flex items-center justify-between gap-3 p-4 font-semibold hover:shadow-lift">
                    {o.name} <Arrow />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
