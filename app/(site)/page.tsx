import Link from "next/link";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db, services, doctors, feedback } from "@/db";
import { getSettings } from "@/lib/settings";
import { waLink } from "@/lib/whatsapp";
import { LogoMark } from "@/components/Logo";
import { Arrow, Check, Clock, Mail, Phone, Pin, Plus, Sparkle, WhatsApp } from "@/components/Icons";
import { Stars } from "@/components/Stars";
import { FeedbackForm } from "@/components/FeedbackForm";
import { JsonLd } from "@/components/JsonLd";
import { dentistJsonLd, faqJsonLd } from "@/lib/structured-data";
import { homeFaqs } from "@/lib/faqs";
import { AREAS_SERVED, emergencyPhone, slugify, splitList, telHref } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const s = await getSettings();
  const [serviceList, doctorList, reviews] = await Promise.all([
    db.select().from(services).where(eq(services.active, true)).orderBy(asc(services.sortOrder), asc(services.name)),
    db
      .select()
      .from(doctors)
      .where(and(eq(doctors.active, true), isNull(doctors.deletedAt)))
      .orderBy(asc(doctors.createdAt)),
    db.select().from(feedback).where(eq(feedback.published, true)).orderBy(desc(feedback.createdAt)).limit(6),
  ]);

  const aids = splitList(s.medicalAids);
  const emergency = emergencyPhone(s);
  const faqs = homeFaqs(s, doctorList);
  const greeting = `Hello ${s.clinicName}, I would like to enquire about an appointment.`;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(s.mapQuery || s.address)}&output=embed`;

  return (
    <>
      <JsonLd data={dentistJsonLd(s, serviceList, doctorList)} />
      <JsonLd data={faqJsonLd(faqs)} />

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent-50 via-accent-50/60 to-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-accent-500/10 blur-3xl"
        />
        <div className="container-x relative grid items-center gap-12 py-14 md:grid-cols-[1.35fr_1fr] md:py-20">
          <div>
            <h1 className="h-display text-[2.6rem] leading-[1.02] sm:text-6xl">
              <span className="eyebrow mb-5 block leading-normal">Dentist in Ruwa, Zimbabwe • Open 24 hours</span>
              Smile bright with <span className="text-accent-500">{s.clinicName}.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{s.heroMessage}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/book-appointment" className="btn-primary px-6 py-3.5">
                Book a dental appointment <Arrow />
              </Link>
              <Link href="#services" className="btn-ghost">
                Explore our services
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink/75">
              {["Open 24 hours", "24-hour emergency care", "Medical aids accepted"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-accent-600" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="card relative mx-auto w-full max-w-sm p-8 text-center shadow-lift">
            <div className="mx-auto w-fit">
              <LogoMark size={148} alt={`${s.clinicName} logo`} />
            </div>
            <p className="mt-6 text-lg font-semibold text-ink">{s.openingHours}</p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-danger-bg px-3.5 py-1.5 text-sm font-semibold text-danger">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
              </span>
              {s.emergencyMessage}
            </p>
            <a href={telHref(emergency)} className="mt-3 block text-base font-semibold text-ink hover:text-accent-600">
              Emergency line: <span className="whitespace-nowrap">{emergency}</span>
            </a>
            <div className="mt-6 grid gap-2">
              <Link href="/book-appointment" className="link inline-flex items-center justify-center gap-1.5">
                Request appointment <Arrow />
              </Link>
              <a
                href={waLink(s.whatsappNumber, greeting)}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-muted hover:text-success"
              >
                <WhatsApp className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Services ---------- */}
      <section id="services" className="py-20 md:py-24">
        <div className="container-x">
          <div className="max-w-2xl">
            <p className="eyebrow">Our services</p>
            <h2 className="h-display mt-4 text-3xl sm:text-4xl">Dental services in Ruwa.</h2>
            <p className="mt-4 leading-relaxed text-muted">
              Complete care for every smile, from routine examinations and cleaning to restorative and replacement
              dentistry, all at one clinic on Runyararo Road.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {serviceList.map((svc) => (
              <article key={svc.id} className="card group flex flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-lift">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-500">
                  <Sparkle className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">
                  <Link href={`/services/${slugify(svc.name)}`} className="hover:text-accent-700">
                    {svc.name}
                  </Link>
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{svc.shortDescription}</p>
                {svc.price && <p className="mt-3 text-sm font-semibold text-ink">From {svc.price}</p>}
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <Link href={`/book-appointment?service=${svc.id}`} className="link inline-flex items-center gap-1.5">
                    Book this service <Arrow />
                  </Link>
                  <Link href={`/services/${slugify(svc.name)}`} className="font-medium text-muted hover:text-ink">
                    Learn more<span className="sr-only"> about {svc.name}</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Doctors ---------- */}
      <section id="doctors" className="bg-surface py-20 md:py-24">
        <div className="container-x">
          <div className="max-w-2xl">
            <p className="eyebrow">Our dentists</p>
            <h2 className="h-display mt-4 text-3xl sm:text-4xl">Meet your dentist in Ruwa.</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {doctorList.map((doc) => {
              const initial = doc.fullName.replace(/^Dr\.?\s+/i, "").charAt(0).toUpperCase();
              return (
                <article key={doc.id} className="card p-6">
                  <div className="flex items-center gap-4">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-100 to-accent-50 text-2xl font-bold text-accent-600">
                      {initial}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-ink">{doc.fullName}</h3>
                      <p className="text-sm font-medium text-accent-600">{doc.specialty}</p>
                      {doc.qualifications && <p className="text-sm text-muted">{doc.qualifications}</p>}
                    </div>
                  </div>
                  {doc.email && (
                    <a
                      href={`mailto:${doc.email}`}
                      className="mt-4 flex items-center gap-2 rounded-xl bg-accent-50 px-3 py-2.5 text-sm font-medium text-accent-700 hover:bg-accent-100"
                    >
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 truncate">{doc.email}</span>
                    </a>
                  )}
                  {doc.bio && <p className="mt-4 text-sm leading-relaxed text-muted">{doc.bio}</p>}
                  <Link
                    href={`/book-appointment?doctor=${doc.id}`}
                    className="link mt-5 inline-flex items-center gap-1.5 text-sm"
                  >
                    Book appointment <Arrow />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- About ---------- */}
      <section id="about" className="py-20 md:py-24">
        <div className="container-x grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow">About Ruwa Dental</p>
            <h2 className="h-display mt-4 text-3xl sm:text-4xl">Your gateway to healthy smiles.</h2>
            <p className="mt-5 max-w-xl leading-relaxed text-muted">{s.aboutText}</p>
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-6">
              {[
                { n: `${doctorList.length}+`, l: "Dental professionals" },
                { n: `${serviceList.length}+`, l: "Dental services" },
                { n: "24/7", l: "Open every day" },
              ].map((x) => (
                <div key={x.l}>
                  <dt className="sr-only">{x.l}</dt>
                  <dd className="text-3xl font-bold tracking-tight text-accent-500">{x.n}</dd>
                  <dd className="mt-1 text-xs text-muted">{x.l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-2xl bg-navy-800 p-8 text-white shadow-lift">
            <Plus className="h-7 w-7 text-accent-500" />
            <h3 className="mt-4 text-xl font-semibold">Medical aids accepted</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {aids.map((a) => (
                <li key={a} className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90">{a}</li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              Contact the clinic to confirm your cover and any applicable terms.
            </p>
            <Link href="/medical-aids" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-100 hover:text-white">
              Medical aid details <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Local + FAQ ---------- */}
      <section id="faq" className="bg-surface py-20 md:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="eyebrow">Your local dental clinic</p>
            <h2 className="h-display mt-4 text-3xl sm:text-4xl">A trusted dentist in Ruwa, open 24 hours.</h2>
            <p className="mt-5 leading-relaxed text-muted">
              {s.clinicName} is a family dental clinic at {s.address}. We look after patients from across Ruwa and the
              surrounding areas, with check-ups, cleaning, fillings, root canals, extractions, dentures, crowns, bridges
              and implants, plus round-the-clock care for dental emergencies.
            </p>
            <h3 className="mt-8 text-sm font-semibold text-ink">Areas we serve</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {AREAS_SERVED.map((a) => (
                <li key={a} className="rounded-full border border-line bg-white px-3 py-1 text-sm text-ink/80">{a}</li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/emergency-dentist" className="btn-soft">Emergency dentist</Link>
              <Link href="/medical-aids" className="btn-soft">Medical aids</Link>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Frequently asked questions</h2>
            <div className="mt-5 divide-y divide-line rounded-2xl border border-line bg-white">
              {faqs.map((f, i) => (
                <details key={f.q} className="group px-5 py-4" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                    <h3>{f.q}</h3>
                    <span className="text-accent-600 transition group-open:rotate-45" aria-hidden>+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Contact ---------- */}
      <section id="contact" className="bg-navy-800 py-20 text-white md:py-24">
        <div className="container-x grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <p className="eyebrow !text-accent-500">Contact &amp; location</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Visit {s.clinicName}.</h2>
            <ul className="mt-6 space-y-3 text-white/85">
              <li className="flex gap-3"><Pin className="h-5 w-5 shrink-0 text-accent-500" />{s.address}</li>
              <li className="flex gap-3"><Phone className="h-5 w-5 shrink-0 text-accent-500" />{s.phone}</li>
              <li className="flex gap-3">
                <Phone className="h-5 w-5 shrink-0 text-red-400" />
                <a href={telHref(emergency)} className="font-semibold text-white hover:underline">Emergency line (24 hours): {emergency}</a>
              </li>
              <li className="flex gap-3"><Mail className="h-5 w-5 shrink-0 text-accent-500" /><a href={`mailto:${s.email}`} className="hover:text-white">{s.email}</a></li>
              <li className="flex gap-3"><Clock className="h-5 w-5 shrink-0 text-accent-500" />{s.openingHours} · {s.emergencyMessage}</li>
            </ul>
            <a
              href={waLink(s.whatsappNumber, greeting)}
              target="_blank"
              rel="noopener"
              className="btn mt-7 bg-[#25D366] text-white hover:bg-[#1fb958]"
            >
              <WhatsApp /> WhatsApp us
            </a>
          </div>
          <div className="rounded-2xl bg-white p-7 text-ink shadow-lift">
            <h3 className="text-lg font-semibold">Need dental care?</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Select a service, preferred doctor and time. The clinic will then confirm your appointment details.
            </p>
            <Link href="/book-appointment" className="btn-primary mt-5">
              Request appointment
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 md:col-span-2">
            <iframe
              title={`Map showing ${s.address}`}
              src={mapSrc}
              className="h-72 w-full md:h-80"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* ---------- Feedback ---------- */}
      <section id="feedback" className="py-20 md:py-24">
        <div className="container-x">
          <p className="eyebrow">Your experience</p>
          <h2 className="h-display mt-4 text-3xl sm:text-4xl">Share your feedback</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Tell {s.clinicName} about your experience. Feedback is reviewed by the clinic before it can appear publicly.
          </p>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <FeedbackForm />
            <div className="space-y-4">
              {reviews.length === 0 && (
                <p className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted">
                  Patient reviews will appear here once published.
                </p>
              )}
              {reviews.map((r) => (
                <figure key={r.id} className="card p-5">
                  <Stars rating={r.rating} />
                  <blockquote className="mt-2 text-sm leading-relaxed text-ink">“{r.message}”</blockquote>
                  <figcaption className="mt-3 text-sm font-semibold text-ink">{r.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
