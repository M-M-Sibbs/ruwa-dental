import Link from "next/link";
import type { Settings } from "@/db/schema";
import { Logo } from "./Logo";
import { Facebook, Instagram, Linkedin, Mail, Phone, Pin, Tiktok, WhatsApp, Youtube, Clock } from "./Icons";
import { waLink } from "@/lib/whatsapp";
import { emergencyPhone, slugify, telHref } from "@/lib/site";

export function SiteFooter({ s, services = [] }: { s: Settings; services?: string[] }) {
  const emergency = emergencyPhone(s);
  const socials = [
    { url: s.facebookUrl, label: "Facebook", Icon: Facebook },
    { url: s.instagramUrl, label: "Instagram", Icon: Instagram },
    { url: s.linkedinUrl, label: "LinkedIn", Icon: Linkedin },
    { url: s.tiktokUrl, label: "TikTok", Icon: Tiktok },
    { url: s.youtubeUrl, label: "YouTube", Icon: Youtube },
  ].filter((x) => !!x.url);

  return (
    <footer className="bg-navy-950 text-white/75">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo clinicName={s.clinicName} light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">{s.heroMessage}</p>
          <div className="mt-5 flex gap-2">
            <a
              href={waLink(s.whatsappNumber, `Hello ${s.clinicName}, I would like to enquire about an appointment.`)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="WhatsApp"
              target="_blank"
              rel="noopener"
            >
              <WhatsApp />
            </a>
            {socials.map(({ url, label, Icon }) => (
              <a
                key={label}
                href={url!}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                aria-label={label}
                target="_blank"
                rel="noopener"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5"><Pin className="h-4 w-4 shrink-0 translate-y-0.5 text-accent-500" />{s.address}</li>
            <li className="flex gap-2.5"><Phone className="h-4 w-4 shrink-0 translate-y-0.5 text-accent-500" />{s.phone}</li>
            <li className="flex gap-2.5"><Mail className="h-4 w-4 shrink-0 translate-y-0.5 text-accent-500" /><a href={`mailto:${s.email}`} className="hover:text-white">{s.email}</a></li>
            <li className="flex gap-2.5"><Clock className="h-4 w-4 shrink-0 translate-y-0.5 text-accent-500" />{s.openingHours}</li>
            <li className="flex gap-2.5 font-semibold text-white">
              <Phone className="h-4 w-4 shrink-0 translate-y-0.5 text-red-400" />
              <a href={telHref(emergency)} className="hover:underline">Emergency line: {emergency}</a>
            </li>
            <li className="pl-6.5 text-white/60">{s.emergencyMessage}</li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Patients</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/book-appointment" className="hover:text-white">Book an appointment</Link></li>
            <li><Link href="/track-booking" className="hover:text-white">Track your booking</Link></li>
            <li><Link href="/emergency-dentist" className="hover:text-white">Emergency dentist</Link></li>
            <li><Link href="/medical-aids" className="hover:text-white">Medical aids</Link></li>
            <li><Link href="/#feedback" className="hover:text-white">Share feedback</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy notice</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Dental services in Ruwa</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {services.map((name) => (
              <li key={name}>
                <Link href={`/services/${slugify(name)}`} className="hover:text-white">{name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-white/45 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {s.clinicName}. All rights reserved.</p>
          <p>Dental clinic in Ruwa, Zimbabwe</p>
        </div>
      </div>
    </footer>
  );
}
