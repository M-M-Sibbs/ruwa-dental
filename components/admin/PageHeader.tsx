export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-ink">{title}</h1>
        {subtitle && <p className="mt-1.5 text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Notice({ children, tone = "success" }: { children: React.ReactNode; tone?: "success" | "danger" }) {
  return (
    <p
      role="status"
      className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${tone === "success" ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}
    >
      {children}
    </p>
  );
}
