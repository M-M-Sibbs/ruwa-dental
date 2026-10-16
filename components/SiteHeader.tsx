"use client";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { Close, Menu } from "./Icons";

const links = [
  { href: "/#services", label: "Services" },
  { href: "/#doctors", label: "Doctors" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
  { href: "/track-booking", label: "Track Booking" },
];

export function SiteHeader({ clinicName }: { clinicName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur">
      <div className="container-x flex h-[72px] items-center justify-between gap-4">
        <Logo clinicName={clinicName} />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-ink/80 hover:text-accent-600">
              {l.label}
            </Link>
          ))}
          <Link href="/book-appointment" className="btn-primary px-4 py-2.5">
            Book Appointment
          </Link>
        </nav>
        <button
          type="button"
          className="rounded-lg p-2 text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <Close className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-white md:hidden" aria-label="Mobile">
          <div className="container-x flex flex-col py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-[15px] font-medium text-ink hover:bg-accent-50"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/book-appointment" onClick={() => setOpen(false)} className="btn-primary mt-2">
              Book Appointment
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
