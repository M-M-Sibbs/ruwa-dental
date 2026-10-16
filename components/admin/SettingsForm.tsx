"use client";
import { useActionState } from "react";
import { saveSettings } from "@/app/actions/admin";
import type { FormState } from "@/app/actions/public";
import type { Settings } from "@/db/schema";
import { SubmitButton } from "@/components/SubmitButton";
import { AreaField, FormMessage, TextField } from "./Fields";

type S = Omit<Settings, "createdAt" | "updatedAt" | "id">;

export function SettingsForm({ initial }: { initial: S }) {
  const [state, action] = useActionState<FormState, FormData>(saveSettings, {});
  const v: Record<string, string> = { ...(Object.fromEntries(Object.entries(initial).map(([k, x]) => [k, x ?? ""])) as Record<string, string>), ...state.values };
  const e = state.errors ?? {};
  const f = (name: keyof S, label: string, extra: Record<string, unknown> = {}) => (
    <TextField label={label} name={name} defaultValue={v[name]} error={e[name]} {...extra} />
  );
  return (
    <form action={action} className="space-y-8">
      <section className="card grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="text-lg font-bold sm:col-span-2">Clinic identity &amp; contact</h2>
        {f("clinicName", "Clinic name")}
        {f("phone", "Phone")}
        {f("email", "Email", { type: "email" })}
        {f("address", "Address")}
        {f("openingHours", "Opening hours")}
        {f("emergencyMessage", "Emergency message")}
        {f("whatsappNumber", "WhatsApp number (receives booking alerts)", { placeholder: "263783397863" })}
        {f("mapQuery", "Map location (search text for Google Maps)")}
        <AreaField label="Accepted medical aids" name="medicalAids" defaultValue={v.medicalAids} error={e.medicalAids} className="sm:col-span-2" />
      </section>
      <section className="card grid gap-4 p-6">
        <h2 className="text-lg font-bold">Homepage</h2>
        <AreaField label="Homepage hero message" name="heroMessage" defaultValue={v.heroMessage} error={e.heroMessage} />
        <AreaField label="About paragraph" name="aboutText" rows={4} defaultValue={v.aboutText} error={e.aboutText} />
      </section>
      <section className="card grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="text-lg font-bold sm:col-span-2">Social channels</h2>
        {f("facebookUrl", "Facebook URL", { type: "url" })}
        {f("instagramUrl", "Instagram URL", { type: "url" })}
        {f("linkedinUrl", "LinkedIn URL", { type: "url" })}
        {f("tiktokUrl", "TikTok URL", { type: "url" })}
        {f("youtubeUrl", "YouTube URL", { type: "url" })}
      </section>
      <div className="flex items-center gap-4">
        <SubmitButton>Save website settings</SubmitButton>
        <FormMessage ok={state.ok} message={state.message ?? (state.errors ? "Please fix the highlighted fields." : undefined)} />
      </div>
    </form>
  );
}
