import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { LogoMark } from "@/components/Logo";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-900 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center text-white">
          <LogoMark size={64} tile />
          <h1 className="mt-4 text-xl font-bold">Ruwa Dental</h1>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">Administration</p>
        </div>
        <LoginForm next={next ?? "/admin"} />
        <p className="mt-6 text-center text-xs text-white/40">Staff only. Access is logged.</p>
      </div>
    </main>
  );
}
