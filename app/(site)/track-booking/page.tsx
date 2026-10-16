import type { Metadata } from "next";
import { TrackForm } from "@/components/TrackForm";

export const metadata: Metadata = {
  title: "Track your booking",
  description: "Check the status of your Ruwa Dental Center appointment with your booking code and phone number.",
};

export default function TrackPage() {
  return (
    <section className="bg-gradient-to-b from-accent-50 to-white py-14 md:py-20">
      <div className="container-x max-w-3xl">
        <p className="eyebrow">Appointment tracking</p>
        <h1 className="h-display mt-4 text-4xl sm:text-5xl">Track your booking</h1>
        <p className="mt-4 text-muted">Enter your booking code and the same phone number used when booking.</p>
        <TrackForm />
      </div>
    </section>
  );
}
