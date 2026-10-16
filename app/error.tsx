"use client";
import Link from "next/link";
import { useEffect } from "react";

// Friendly fallback for unexpected errors (the details are in the server log).
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="card max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Something went wrong.</h1>
        <p className="mt-3 text-muted">
          Please try again. If this keeps happening, call the clinic or message us on WhatsApp.
        </p>
        {error.digest && <p className="mt-3 font-mono text-xs text-muted">Reference: {error.digest}</p>}
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={reset} className="btn-primary">Try again</button>
          <Link href="/" className="btn-soft">Home</Link>
        </div>
      </div>
    </main>
  );
}
