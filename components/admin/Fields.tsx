"use client";
// Small labelled inputs used across admin forms.
type Base = { label: string; name: string; error?: string; className?: string };

export function TextField({ label, name, error, className = "", ...rest }: Base & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className="label" htmlFor={`fld-${name}`}>{label}</label>
      <input id={`fld-${name}`} name={name} className="input" aria-invalid={!!error} {...rest} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function AreaField({ label, name, error, className = "", ...rest }: Base & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={className}>
      <label className="label" htmlFor={`fld-${name}`}>{label}</label>
      <textarea id={`fld-${name}`} name={name} rows={2} className="input" aria-invalid={!!error} {...rest} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function SelectField({
  label,
  name,
  error,
  className = "",
  options,
  ...rest
}: Base & { options: { value: string; label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={className}>
      <label className="label" htmlFor={`fld-${name}`}>{label}</label>
      <select id={`fld-${name}`} name={name} className="input" {...rest}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

export function FormMessage({ ok, message }: { ok?: boolean; message?: string }) {
  if (!message) return null;
  return (
    <p role="status" className={`text-sm font-medium ${ok ? "text-success" : "text-danger"}`}>
      {ok ? "✓ " : ""}{message}
    </p>
  );
}
