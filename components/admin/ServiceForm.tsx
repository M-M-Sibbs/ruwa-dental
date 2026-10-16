"use client";
import { useActionState, useEffect, useRef } from "react";
import { saveService } from "@/app/actions/admin";
import type { FormState } from "@/app/actions/public";
import { SubmitButton } from "@/components/SubmitButton";
import { AreaField, FormMessage, TextField } from "./Fields";

export function ServiceForm({
  initial,
}: {
  initial?: { id: string; name: string; shortDescription: string; fullDescription: string; price: string; active: boolean };
}) {
  const [state, action] = useActionState<FormState, FormData>(saveService, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && !initial) ref.current?.reset();
  }, [state, initial]);
  const e = state.errors ?? {};
  const v = { ...initial, ...(state.ok ? {} : state.values) };
  return (
    <form ref={ref} action={action} className="grid gap-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <TextField label="Name" name="name" defaultValue={v.name} error={e.name} />
      <AreaField label="Short description (on the service card)" name="shortDescription" maxLength={200} defaultValue={v.shortDescription} error={e.shortDescription} />
      <AreaField label="Full description" name="fullDescription" rows={3} defaultValue={v.fullDescription} />
      <TextField label="Price (optional, shown as “From …”)" name="price" placeholder="US$30" defaultValue={v.price} />
      {initial && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={initial.active} className="h-4 w-4 accent-[#4fa8e2]" /> Show on website and booking form
        </label>
      )}
      <div className="flex items-center gap-4">
        <SubmitButton>{initial ? "Save service" : "Add service"}</SubmitButton>
        <FormMessage ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}
