"use client";
import { useActionState } from "react";
import { trackBooking, type FormState } from "@/app/actions/public";
import { SubmitButton } from "./SubmitButton";
import { StatusPill } from "./StatusPill";
import type { AppointmentStatus } from "@/db/schema";

export function TrackForm() {
  const [state, action] = useActionState<FormState, FormData>(trackBooking, {});
  const v = state.values ?? {};
  const e = state.errors ?? {};
  const b = state.data;

  return (
    <>
      <form action={action} className="card mt-8 grid gap-4 p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-start" noValidate>
        <div>
          <label className="label" htmlFor="code">Booking code</label>
          <input id="code" name="code" className="input font-mono uppercase" placeholder="e.g. RDC-EC159C" defaultValue={v.code} autoCapitalize="characters" />
          {e.code && <p className="mt-1 text-xs text-danger">{e.code}</p>}
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone number</label>
          <input id="phone" name="phone" type="tel" inputMode="tel" className="input" placeholder="078 000 0000" defaultValue={v.phone} />
          {e.phone && <p className="mt-1 text-xs text-danger">{e.phone}</p>}
        </div>
        <div className="sm:pt-[22px]">
          <SubmitButton pendingText="Checking…" className="btn-primary w-full">Track booking</SubmitButton>
        </div>
        {state.message && <p className="text-sm text-danger sm:col-span-3" role="alert">{state.message}</p>}
      </form>

      {b && (
        <div className="card mt-8 p-6 sm:p-8" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Booking found</p>
              <h2 className="mt-2 font-mono text-3xl font-bold tracking-wide">{b.code}</h2>
            </div>
            <StatusPill status={b.status as AppointmentStatus} />
          </div>
          <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <Item label="Date" value={b.date} />
            <Item label="Time" value={b.time} />
            <Item label="Doctor" value={b.doctor} />
            <Item label="Service" value={b.service} />
            <Item label="Location" value={b.location} />
          </dl>
          {b.note && (
            <p className="mt-6 rounded-xl bg-accent-50 px-4 py-3 text-sm text-ink">
              <strong>Clinic note:</strong> {b.note}
            </p>
          )}
        </div>
      )}
    </>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-semibold text-ink">{value || "—"}</dd>
    </div>
  );
}
