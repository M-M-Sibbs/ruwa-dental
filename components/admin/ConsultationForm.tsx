"use client";
import { useActionState, useEffect, useRef } from "react";
import { addConsultation } from "@/app/actions/admin";
import type { FormState } from "@/app/actions/public";
import { SubmitButton } from "@/components/SubmitButton";
import { AreaField, FormMessage, SelectField, TextField } from "./Fields";

export function ConsultationForm({
  patientId,
  appointments,
  doctors,
  pickDoctor,
}: {
  patientId: string;
  appointments: { value: string; label: string }[];
  doctors: { value: string; label: string }[];
  pickDoctor: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(addConsultation, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  const e = state.errors ?? {};
  const v = state.ok ? {} : (state.values ?? {});

  return (
    <form ref={ref} action={action} className="grid gap-4">
      <input type="hidden" name="patientId" value={patientId} />
      {pickDoctor && (
        <SelectField label="Doctor" name="doctorId" defaultValue={v.doctorId ?? doctors[0]?.value} options={doctors} />
      )}
      {appointments.length > 0 && (
        <SelectField
          label="Linked appointment (marks it completed)"
          name="appointmentId"
          defaultValue=""
          options={[{ value: "", label: "None" }, ...appointments]}
        />
      )}
      <AreaField label="Presenting complaint" name="presentingComplaint" defaultValue={v.presentingComplaint} error={e.presentingComplaint} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="BP" name="bp" placeholder="120/80" defaultValue={v.bp} />
        <TextField label="Temp °C" name="temperatureC" inputMode="decimal" defaultValue={v.temperatureC} error={e.temperatureC} />
        <TextField label="Weight kg" name="weightKg" inputMode="decimal" defaultValue={v.weightKg} error={e.weightKg} />
        <TextField label="Pulse" name="pulse" inputMode="numeric" defaultValue={v.pulse} error={e.pulse} />
      </div>
      <AreaField label="Clinical notes" name="clinicalNotes" rows={3} defaultValue={v.clinicalNotes} />
      <AreaField label="Diagnosis" name="diagnosis" defaultValue={v.diagnosis} />
      <AreaField label="Treatment" name="treatment" defaultValue={v.treatment} />
      <TextField label="Follow-up date" name="followUpDate" type="date" defaultValue={v.followUpDate} />

      <fieldset className="mt-2 grid gap-3 border-t border-line pt-5">
        <legend className="pr-2 text-lg font-bold tracking-tight">Prescription (optional)</legend>
        <TextField label="Medicine" name="medicine" defaultValue={v.medicine} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Dosage" name="dosage" placeholder="500 mg" defaultValue={v.dosage} />
          <TextField label="Frequency" name="frequency" placeholder="2 times a day" defaultValue={v.frequency} />
          <TextField label="Duration" name="duration" placeholder="5 days" defaultValue={v.duration} />
        </div>
        <AreaField label="Instructions" name="instructions" defaultValue={v.instructions} />
      </fieldset>

      <div className="flex items-center gap-4">
        <SubmitButton>Save consultation</SubmitButton>
        <FormMessage ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}
