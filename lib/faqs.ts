import type { Settings } from "@/db/schema";
import { AREAS_SERVED, emergencyPhone, splitList } from "./site";

export function homeFaqs(s: Settings, dentists: { fullName: string; qualifications: string | null }[]) {
  const aids = splitList(s.medicalAids);
  const lead = dentists[0];
  const faqs = [
    {
      q: "Where is Ruwa Dental Center?",
      a: `We are at ${s.address}, Zimbabwe. Patients visit us from ${AREAS_SERVED.slice(1, 6).join(", ")} and the eastern suburbs of Harare.`,
    },
    {
      q: "Is there a dentist open 24 hours in Ruwa?",
      a: `Yes. ${s.clinicName} is open 24 hours, every day, for dental emergencies. Call or WhatsApp our emergency line on ${emergencyPhone(s)}.`,
    },
    {
      q: "Which medical aids do you accept?",
      a: `We accept ${aids.join(", ")}. Please contact the clinic to confirm your cover and any applicable terms.`,
    },
    {
      q: "How do I book an appointment with a dentist in Ruwa?",
      a: "Book online in about two minutes, or call or WhatsApp the clinic. After booking online you get a tracking code to check when your appointment is confirmed.",
    },
  ];
  if (lead) {
    faqs.push({
      q: "Who is the dentist at Ruwa Dental Center?",
      a: `Our principal dentist is ${lead.fullName}${lead.qualifications ? `, ${lead.qualifications}` : ""}.`,
    });
  }
  return faqs;
}
