import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-accent-50 px-4 text-center">
      <LogoMark size={88} />
      <h1 className="h-display mt-6 text-3xl">We couldn&apos;t find that page.</h1>
      <p className="mt-3 text-muted">If you were looking for a booking, track it with your code and phone number.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-primary">Go home</Link>
        <Link href="/track-booking" className="btn-soft">Track booking</Link>
      </div>
    </main>
  );
}
