import type { DbProblem } from "@/db/prepare";

// Shown instead of a crash when the database isn't ready.
export function SetupNotice({ problem }: { problem: DbProblem }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-accent-50 px-4 py-12">
      <div className="card w-full max-w-xl p-8">
        <p className="eyebrow">Setup needed</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">{problem.title}</h1>
        <p className="mt-3 text-muted">{problem.detail}</p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-ink">
          {problem.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="mt-6 text-xs text-muted">The README in the project folder has the full setup steps.</p>
      </div>
    </main>
  );
}
