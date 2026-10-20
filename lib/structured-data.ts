// schema.org data that tells Google exactly what the clinic is, where it is and when it's open.
import type { Settings } from "@/db/schema";
import { AREAS_SERVED, SITE_URL, emergencyPhone, firstPhone, intlDigits, slugify } from "./site";

export function dentistJsonLd(
  s: Settings,
  services: { name: string; shortDescription: string }[],
  doctors: { fullName: string; specialty: string; qualifications: string | null }[],
) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.mapQuery || s.address)}`;
  return {
    "@context": "https://schema.org",
    "@type": ["Dentist", "MedicalClinic"],
    "@id": `${SITE_URL}/#clinic`,
    name: s.clinicName,
    alternateName: ["Ruwa Dental", "Ruwa Dental Centre", "Dentist in Ruwa"],
    description: `${s.clinicName} is a dental clinic in Ruwa, Zimbabwe, open 24 hours. ${s.heroMessage}`,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.png`,
    image: [`${SITE_URL}/opengraph-image.png`, `${SITE_URL}/brand/logo.png`],
    telephone: `+${intlDigits(firstPhone(s.phone))}`,
    email: s.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.address.split(",")[0].trim(),
      addressLocality: "Ruwa",
      addressRegion: "Mashonaland East",
      addressCountry: "ZW",
    },
    hasMap: mapUrl,
    areaServed: AREAS_SERVED.map((name) => ({ "@type": "Place", name: `${name}, Zimbabwe` })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "00:00",
        closes: "23:59",
      },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "emergency",
        telephone: `+${intlDigits(emergencyPhone(s))}`,
        availableLanguage: ["English", "Shona"],
        hoursAvailable: { "@type": "OpeningHoursSpecification", opens: "00:00", closes: "23:59" },
      },
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: `+${intlDigits(firstPhone(s.phone))}`,
        availableLanguage: ["English", "Shona"],
      },
    ],
    medicalSpecialty: "Dentistry",
    isAcceptingNewPatients: true,
    knowsAbout: services.map((x) => x.name),
    availableService: services.map((x) => ({
      "@type": "MedicalProcedure",
      name: x.name,
      description: x.shortDescription,
      url: `${SITE_URL}/services/${slugify(x.name)}`,
    })),
    employee: doctors.map((d) => ({
      "@type": "Person",
      name: d.fullName,
      jobTitle: d.specialty,
      ...(d.qualifications ? { honorificSuffix: d.qualifications } : {}),
    })),
    paymentAccepted: ["Cash", "Medical aid"],
    sameAs: [s.facebookUrl, s.instagramUrl, s.linkedinUrl, s.tiktokUrl, s.youtubeUrl].filter(Boolean),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}
