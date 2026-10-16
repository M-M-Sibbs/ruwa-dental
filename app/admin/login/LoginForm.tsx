"use client";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(login, {});
  return (
    <form action={action} className="rounded-2xl bg-white p-6 shadow-lift">
      <input type="hidden" name="next" value={next} />
      <label className="label" htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="username" className="input" defaultValue={state.email} key={state.email} required />
      <label className="label mt-4" htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" className="input" required autoFocus={!!state.error} />
      {state.error && <p className="mt-3 text-sm text-danger" role="alert">{state.error}</p>}
      <SubmitButton pendingText="Signing in…" className="btn-primary mt-6 w-full">Sign in</SubmitButton>
    </form>
  );
}
