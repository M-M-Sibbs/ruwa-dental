"use client";
import { useActionState, useMemo, useState } from "react";
import { submitBooking, type FormState } from "@/app/actions/public";
import { SubmitButton } from "./SubmitButton";
import { Arrow } from "./Icons";

type Opt = { id: string; name: string };

export function BookingForm({
  services,
  doctors,
  branches,
  links,
  today,
  preset,
}: {
  services: Opt[];
  doctors: Opt[];
  branches: (Opt & { address: string })[];
  links: { doctorId: string; serviceId: string }[];
  today: string;
  preset: { serviceId?: string; doctorId?: string };
}) {
  const [state, action] = useActionState<FormState, FormData>(submitBooking, {});
  const v = state.values ?? {};
  const e = state.errors ?? {};
  const [serviceId, setServiceId] = useState(v.serviceId ?? preset.serviceId ?? "");

  // Only list doctors who offer the chosen service (all doctors if none are linked).
  const doctorOptions = useMemo(() => {
    if (!serviceId) return doctors;
    const ids = new Set(links.filter((l) => l.serviceId === serviceId).map((l) => l.doctorId));
    return ids.size ? doctors.filter((d) => ids.has(d.id)) : doctors;
  }, [serviceId, doctors, links]);

  return (
    <form action={action} className="card -mt-2 p-6 sm:p-10" noValidate>
      <h2 className="text-2xl font-bold tracking-tight">Patient details</h2>
      <div className="hidden" aria-hidden>
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.message && (
        <p className="mt-4 rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger" role="alert">
          {state.message}
        </p>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Input label="First name" name="firstName" autoComplete="given-name" defaultValue={v.firstName} error={e.firstName} />
        <Input label="Last name" name="lastName" autoComplete="family-name" defaultValue={v.lastName} error={e.lastName} />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="078 000 0000"
          autoComplete="tel"
          defaultValue={v.phone}
          error={e.phone}
          hint="Use this number later to track your booking."
        />
        <Input label="Email (optional)" name="email" type="email" autoComplete="email" defaultValue={v.email} error={e.email} />

        <div>
          <label className="label" htmlFor="serviceId">Service</label>
          <select
            id="serviceId"
            name="serviceId"
            className="input"
            value={serviceId}
            onChange={(ev) => setServiceId(ev.target.value)}
            aria-invalid={!!e.serviceId}
          >
            <option value="">Select service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {e.serviceId && <p className="mt-1 text-xs text-danger">{e.serviceId}</p>}
        </div>
        <div>
          <label className="label" htmlFor="doctorId">Preferred doctor</label>
          <select id="doctorId" name="doctorId" className="input" defaultValue={v.doctorId ?? preset.doctorId ?? ""}>
            <option value="">Any available doctor</option>
            {doctorOptions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="branchId">Location</label>
          <select id="branchId" name="branchId" className="input" defaultValue={v.branchId ?? branches[0]?.id}>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name} — {b.address}</option>
            ))}
          </select>
        </div>
        <Input label="Preferred date" name="preferredDate" type="date" min={today} defaultValue={v.preferredDate} error={e.preferredDate} />
        <Input
          label="Preferred time"
          name="preferredTime"
          type="time"
          step={900}
          defaultValue={v.preferredTime}
          error={e.preferredTime}
          hint="We are open 24 hours. For an emergency, call or WhatsApp us straight away."
        />
        <div className="sm:col-span-2">
          <label className="label" htmlFor="reason">Reason for visit (optional)</label>
          <textarea id="reason" name="reason" rows={4} maxLength={500} className="input" defaultValue={v.reason} placeholder="For example: tooth pain on the lower left, check-up, cleaning…" />
          {e.reason && <p className="mt-1 text-xs text-danger">{e.reason}</p>}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton pendingText="Sending request…" className="btn-primary px-6 py-3.5">
          Send appointment request <Arrow />
        </SubmitButton>
        <p className="text-xs text-muted">
          Your details are used only to manage your dental care. See our <a href="/privacy" className="link">privacy notice</a>.
        </p>
      </div>
    </form>
  );
}

function Input({
  label,
  name,
  error,
  hint,
  type = "text",
  ...rest
}: { label: string; name: string; error?: string; hint?: string; type?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} className="input" aria-invalid={!!error} {...rest} />
      {error ? (
        <p className="mt-1 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
