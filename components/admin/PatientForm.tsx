"use client";
import { useActionState } from "react";
import { createPatient, updatePatient } from "@/app/actions/admin";
import type { FormState } from "@/app/actions/public";
import { SubmitButton } from "@/components/SubmitButton";
import { AreaField, FormMessage, SelectField, TextField } from "./Fields";

export type PatientValues = Partial<Record<
  "id" | "firstName" | "lastName" | "phone" | "email" | "dateOfBirth" | "gender" | "nationalId" | "bloodGroup" | "address" | "allergies" | "chronicConditions" | "emergencyContact",
  string
>>;

const BLOOD = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function PatientForm({ initial, mode }: { initial?: PatientValues; mode: "create" | "edit" }) {
  const [state, action] = useActionState<FormState, FormData>(mode === "create" ? createPatient : updatePatient, {});
  const v = { ...initial, ...state.values };
  const e = state.errors ?? {};
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <TextField label="First name" name="firstName" defaultValue={v.firstName} error={e.firstName} required />
      <TextField label="Last name" name="lastName" defaultValue={v.lastName} error={e.lastName} required />
      <TextField label="Phone" name="phone" type="tel" defaultValue={v.phone} error={e.phone} required />
      <TextField label="Email" name="email" type="email" defaultValue={v.email} error={e.email} />
      <TextField label="Date of birth" name="dateOfBirth" type="date" defaultValue={v.dateOfBirth} error={e.dateOfBirth} />
      <SelectField
        label="Gender"
        name="gender"
        defaultValue={v.gender ?? ""}
        options={[{ value: "", label: "—" }, { value: "Female", label: "Female" }, { value: "Male", label: "Male" }, { value: "Other", label: "Other" }]}
      />
      <TextField label="National ID" name="nationalId" defaultValue={v.nationalId} />
      <SelectField label="Blood group" name="bloodGroup" defaultValue={v.bloodGroup ?? ""} options={BLOOD.map((b) => ({ value: b, label: b || "—" }))} />
      <AreaField label="Address" name="address" defaultValue={v.address} className="sm:col-span-2" />
      <AreaField label="Allergies" name="allergies" defaultValue={v.allergies} />
      <AreaField label="Chronic conditions" name="chronicConditions" defaultValue={v.chronicConditions} />
      <TextField label="Emergency contact" name="emergencyContact" placeholder="Name and phone" defaultValue={v.emergencyContact} className="sm:col-span-2" />
      <div className="flex items-center gap-4 sm:col-span-2">
        <SubmitButton>{mode === "create" ? "Add patient" : "Save details"}</SubmitButton>
        <FormMessage ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}
