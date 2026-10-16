"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "@/components/Logo";
import { Close, Menu } from "@/components/Icons";
import { logout } from "@/app/actions/auth";

type Item = { href: string; label: string; icon: string };

export function AdminShell({
  items,
  userName,
  roleLabel,
  clinicName,
  children,
}: {
  items: Item[];
  userName: string;
  roleLabel: string;
  clinicName: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

  const nav = (
    <nav className="mt-8 flex flex-col gap-1" aria-label="Admin">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            active(i.href) ? "bg-white/12 text-white" : "text-white/70 hover:bg-white/6 hover:text-white"
          }`}
          aria-current={active(i.href) ? "page" : undefined}
        >
          <span className="w-4 text-center text-[13px] opacity-80" aria-hidden>{i.icon}</span>
          {i.label}
        </Link>
      ))}
      <form action={logout} className="mt-4">
        <button className="w-full rounded-xl border border-white/15 px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/6">
          Sign out
        </button>
      </form>
    </nav>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-3">
      <LogoMark size={36} tile />
      <span className="leading-tight">
        <span className="block text-[15px] font-bold text-white">Ruwa Dental</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Administration</span>
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden bg-navy-900 px-4 py-6 lg:sticky lg:top-0 lg:block lg:h-screen">{brand}{nav}</aside>

      <div className="flex items-center justify-between bg-navy-900 px-4 py-3 lg:hidden">
        {brand}
        <button onClick={() => setOpen((v) => !v)} className="p-2 text-white" aria-label="Menu" aria-expanded={open}>
          {open ? <Close className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && <div className="bg-navy-900 px-4 pb-5 lg:hidden">{nav}</div>}

      <div className="min-w-0">
        <header className="flex items-center justify-between gap-4 border-b border-line bg-surface px-4 py-4 sm:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">{clinicName}</p>
            <p className="text-sm font-semibold text-ink">
              {userName} <span className="font-normal text-muted">· {roleLabel}</span>
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/admin/account" className="text-muted hover:text-ink">Account</Link>
            <a href="/" target="_blank" className="link">View website ↗</a>
          </div>
        </header>
        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
