"use client";
import { useActionState, useEffect, useRef } from "react";
import { changePassword, createStaff } from "@/app/actions/admin";
import type { FormState } from "@/app/actions/public";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage, SelectField, TextField } from "./Fields";

export function PasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(changePassword, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  const e = state.errors ?? {};
  return (
    <form ref={ref} action={action} className="grid gap-4">
      <TextField label="Current password" name="current" type="password" autoComplete="current-password" error={e.current} />
      <TextField label="New password" name="next" type="password" autoComplete="new-password" error={e.next} />
      <TextField label="Confirm new password" name="confirm" type="password" autoComplete="new-password" error={e.confirm} />
      <div className="flex items-center gap-4">
        <SubmitButton>Change password</SubmitButton>
        <FormMessage ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}

export function StaffForm() {
  const [state, action] = useActionState<FormState, FormData>(createStaff, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  const e = state.errors ?? {};
  const v = state.ok ? {} : (state.values ?? {});
  return (
    <form ref={ref} action={action} className="grid gap-4 sm:grid-cols-2" autoComplete="off">
      <TextField label="Name" name="name" defaultValue={v.name} error={e.name} />
      <TextField label="Email" name="email" type="email" defaultValue={v.email} error={e.email} />
      <TextField label="Temporary password" name="password" type="password" autoComplete="new-password" error={e.password} />
      <SelectField
        label="Role"
        name="role"
        defaultValue={v.role ?? "RECEPTION"}
        options={[
          { value: "RECEPTION", label: "Reception — appointments & patients, no clinical notes" },
          { value: "ADMIN", label: "Administrator — full access" },
        ]}
      />
      <div className="flex items-center gap-4 sm:col-span-2">
        <SubmitButton>Add staff login</SubmitButton>
        <FormMessage ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}
