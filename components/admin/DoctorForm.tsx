"use client";
import { useActionState, useEffect, useRef } from "react";
import { createDoctor, updateDoctor } from "@/app/actions/admin";
import type { FormState } from "@/app/actions/public";
import { SubmitButton } from "@/components/SubmitButton";
import { AreaField, FormMessage, SelectField, TextField } from "./Fields";

type Opt = { value: string; label: string };
export type DoctorValues = {
  id?: string;
  fullName?: string;
  specialty?: string;
  qualifications?: string;
  bio?: string;
  phone?: string;
  branchId?: string;
  active?: boolean;
  email?: string;
  hasLogin?: boolean;
  serviceIds?: string[];
};

export function DoctorForm({ initial, branches, services }: { initial?: DoctorValues; branches: Opt[]; services: Opt[] }) {
  const edit = !!initial?.id;
  const [state, action] = useActionState<FormState, FormData>(edit ? updateDoctor : createDoctor, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && !edit) ref.current?.reset();
  }, [state, edit]);
  const e = state.errors ?? {};
  const v = { ...initial, ...(state.ok ? {} : state.values) };
  const chosen = new Set(initial?.serviceIds ?? services.map((s) => s.value));

  return (
    <form ref={ref} action={action} className="grid gap-4 sm:grid-cols-2" autoComplete="off">
      {edit && <input type="hidden" name="id" value={initial!.id} />}
      <TextField label="Full name" name="fullName" defaultValue={v.fullName} error={e.fullName} placeholder="Dr …" />
      <TextField label="Specialty" name="specialty" defaultValue={v.specialty ?? "Dental Surgeon"} />
      <TextField label="Qualifications" name="qualifications" defaultValue={v.qualifications} placeholder="BDS (UZ)" />
      <TextField label="Phone" name="phone" type="tel" defaultValue={v.phone} />
      <AreaField label="Short bio (shown on the website)" name="bio" defaultValue={v.bio} className="sm:col-span-2" />
      {initial?.hasLogin ? (
        <TextField label="Login email" name="email" value={initial.email} readOnly className="opacity-70" />
      ) : (
        <TextField label="Login email (optional)" name="email" type="email" defaultValue={v.email} error={e.email} autoComplete="off" />
      )}
      <TextField
        label={initial?.hasLogin ? "New portal password (leave blank to keep)" : "Portal password"}
        name="password"
        type="password"
        error={e.password}
        autoComplete="new-password"
      />
      <SelectField label="Branch" name="branchId" defaultValue={v.branchId ?? ""} options={[{ value: "", label: "Any" }, ...branches]} />
      {edit && (
        <label className="flex items-center gap-2 self-end pb-3 text-sm">
          <input type="checkbox" name="active" defaultChecked={initial?.active} className="h-4 w-4 accent-[#4fa8e2]" /> Active (shown on website, can sign in)
        </label>
      )}
      <fieldset className="sm:col-span-2">
        <legend className="label">Services</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((s) => (
            <label key={s.value} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="serviceIds" value={s.value} defaultChecked={chosen.has(s.value)} className="h-4 w-4 accent-[#4fa8e2]" />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex items-center gap-4 sm:col-span-2">
        <SubmitButton>{edit ? "Save doctor" : "Add doctor"}</SubmitButton>
        <FormMessage ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}
