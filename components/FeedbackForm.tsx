"use client";
import { useActionState, useState } from "react";
import { submitFeedback, type FormState } from "@/app/actions/public";
import { SubmitButton } from "./SubmitButton";
import { Star } from "./Icons";

export function FeedbackForm() {
  const [state, action] = useActionState<FormState, FormData>(submitFeedback, {});
  const [rating, setRating] = useState(0);
  const v = state.values ?? {};
  const e = state.errors ?? {};

  if (state.ok) {
    return (
      <div className="card flex items-center gap-3 border-success/20 bg-success-bg p-6 text-success" role="status">
        <span className="text-xl">✓</span> {state.message}
      </div>
    );
  }

  return (
    <form action={action} className="card grid gap-4 p-6 sm:grid-cols-2" noValidate>
      <div className="hidden" aria-hidden>
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Field label="Name" name="name" error={e.name} defaultValue={v.name} autoComplete="name" required />
      <Field label="Phone" name="phone" type="tel" error={e.phone} defaultValue={v.phone} autoComplete="tel" />
      <Field label="Email" name="email" type="email" error={e.email} defaultValue={v.email} autoComplete="email" />
      <div>
        <span className="label" id="rating-label">Rating</span>
        <input type="hidden" name="rating" value={rating || ""} />
        <div className="flex h-[42px] items-center gap-1" role="radiogroup" aria-labelledby="rating-label">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={rating === i}
              aria-label={`${i} star${i > 1 ? "s" : ""}`}
              onClick={() => setRating(i)}
              className={`rounded p-0.5 transition ${i <= rating ? "text-amber-400" : "text-line hover:text-amber-200"}`}
            >
              <Star className="h-7 w-7" filled />
            </button>
          ))}
        </div>
        {e.rating && <p className="mt-1 text-xs text-danger">{e.rating}</p>}
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="fb-message">Feedback</label>
        <textarea id="fb-message" name="message" rows={4} className="input" defaultValue={v.message} maxLength={1000} />
        {e.message && <p className="mt-1 text-xs text-danger">{e.message}</p>}
      </div>
      {state.message && <p className="text-sm text-danger sm:col-span-2">{state.message}</p>}
      <div className="sm:col-span-2">
        <SubmitButton pendingText="Sending…">Send feedback</SubmitButton>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  type = "text",
  ...rest
}: { label: string; name: string; error?: string; type?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `fb-${name}`;
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input id={id} name={name} type={type} className="input" aria-invalid={!!error} {...rest} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
