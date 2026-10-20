import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Privacy notice", alternates: { canonical: "/privacy" } };

export default async function PrivacyPage() {
  const s = await getSettings();
  return (
    <section className="py-16 md:py-20">
      <div className="container-x max-w-3xl">
        <p className="eyebrow">Privacy</p>
        <h1 className="h-display mt-4 text-4xl">Privacy notice</h1>
        <div className="mt-8 space-y-5 leading-relaxed text-ink/85">
          <p>
            {s.clinicName} collects the details you give when you book an appointment or send feedback: your name,
            phone number, email address, preferred appointment and reason for visit. During care we also keep a clinical
            record of your visits, treatments and prescriptions.
          </p>
          <p>
            We use this information only to arrange and provide your dental care, to contact you about your appointments,
            and to keep accurate medical records. We send new booking details to the clinic&apos;s WhatsApp so our team can
            respond quickly.
          </p>
          <p>
            Your records are stored securely and are seen only by clinic staff who need them. Clinical notes are restricted to
            our dentists. We do not sell or share your information for marketing.
          </p>
          <p>
            In line with Zimbabwe&apos;s Cyber and Data Protection Act, you may ask to see or correct the information we hold
            about you. Contact us at <a className="link" href={`mailto:${s.email}`}>{s.email}</a> or {s.phone}.
          </p>
          <p>
            Feedback you send is private until the clinic chooses to publish it. Only your name, rating and message are shown
            publicly.
          </p>
        </div>
      </div>
    </section>
  );
}
