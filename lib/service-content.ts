// Written content for each service page. Used when the clinic hasn't written its
// own "Full description" in Admin → Services. Keyed by the service's URL slug.

export type ServiceCopy = {
  intro: string;
  whatToExpect: string[];
  goodFor: string[];
  faqs: { q: string; a: string }[];
};

export const SERVICE_COPY: Record<string, ServiceCopy> = {
  "full-exams-and-x-ray": {
    intro:
      "A full dental examination is the starting point for every healthy smile. At our Ruwa clinic the dentist checks your teeth, gums, bite and mouth, and takes X-rays where needed to see problems that aren't visible yet.",
    whatToExpect: [
      "A conversation about your dental history and any pain or concerns",
      "A careful check of every tooth, your gums, tongue and soft tissues",
      "Dental X-rays when needed to look for decay, infection or hidden problems",
      "A clear explanation of what we found and a treatment plan with options",
    ],
    goodFor: ["Routine check-ups", "New patients", "Tooth pain you can't pinpoint", "Children's dental check-ups"],
    faqs: [
      {
        q: "How often should I have a dental check-up?",
        a: "Most people benefit from a check-up every six months. Your dentist will advise what is right for you.",
      },
      {
        q: "Are dental X-rays safe?",
        a: "Dental X-rays use a very low dose of radiation and are only taken when they help the dentist diagnose a problem.",
      },
    ],
  },
  "dental-cleaning": {
    intro:
      "Professional dental cleaning removes the plaque and hardened tartar that brushing at home can't reach. It protects your gums, freshens your breath and helps prevent tooth decay.",
    whatToExpect: [
      "Removal of tartar above and below the gum line",
      "Polishing to remove surface stains and plaque",
      "A check of your gum health",
      "Advice on brushing and flossing for your mouth",
    ],
    goodFor: ["Bleeding or swollen gums", "Bad breath", "Stained teeth", "Keeping teeth healthy between check-ups"],
    faqs: [
      {
        q: "Does a dental cleaning hurt?",
        a: "Most people feel little or no discomfort. If your gums are sensitive, tell the dentist and they will take extra care.",
      },
      {
        q: "How often should I have my teeth cleaned?",
        a: "Usually every six months, alongside your check-up. People with gum disease may need cleanings more often.",
      },
    ],
  },
  "fillings-root-canals-and-extraction": {
    intro:
      "When a tooth is decayed, cracked or infected, we focus on relieving your pain and saving the tooth where possible. That may mean a filling, root canal treatment, or a gentle extraction when a tooth can't be saved.",
    whatToExpect: [
      "Pain relief and local anaesthetic so treatment is comfortable",
      "Fillings to repair cavities and small cracks",
      "Root canal treatment to clear infection and keep a natural tooth",
      "Careful extractions, including aftercare advice to help you heal",
    ],
    goodFor: ["Toothache", "Holes or cavities", "Sensitivity to hot or cold", "Broken or badly damaged teeth"],
    faqs: [
      {
        q: "Is a root canal painful?",
        a: "Root canal treatment is done under local anaesthetic and usually feels similar to having a filling. It relieves the pain caused by the infection.",
      },
      {
        q: "Can I have a tooth removed the same day?",
        a: "In many cases, yes. Call or WhatsApp the clinic and the dentist will advise after examining the tooth.",
      },
    ],
  },
  "full-and-partial-dentures": {
    intro:
      "Dentures replace missing teeth so you can eat, speak and smile with confidence. We make full dentures for when all teeth are missing, and partial dentures that fill gaps between your natural teeth.",
    whatToExpect: [
      "An examination and impressions of your mouth",
      "Choosing the shape and shade of your new teeth",
      "Fitting and adjustments for comfort",
      "Advice on caring for your dentures",
    ],
    goodFor: ["Several missing teeth", "All teeth missing", "Replacing old, loose dentures"],
    faqs: [
      {
        q: "How long does it take to get dentures?",
        a: "It usually takes a few visits over several weeks to take impressions, try them in and make final adjustments.",
      },
      {
        q: "Can my old dentures be adjusted?",
        a: "Often, yes. Bring them to the clinic and the dentist will check whether they can be repaired or relined.",
      },
    ],
  },
  "crowns-and-bridges": {
    intro:
      "Crowns and bridges are fixed restorations that rebuild damaged teeth and replace missing ones. A crown covers and protects a weak tooth; a bridge fills a gap by anchoring a false tooth to the teeth beside it.",
    whatToExpect: [
      "An examination and, where needed, X-rays",
      "Preparing the tooth and taking impressions",
      "A temporary crown while the permanent one is made",
      "Fitting and bonding the final crown or bridge",
    ],
    goodFor: ["Cracked or heavily filled teeth", "Teeth after root canal treatment", "A gap from a missing tooth"],
    faqs: [
      {
        q: "How long do crowns last?",
        a: "With good brushing, flossing and regular check-ups, crowns often last many years.",
      },
      {
        q: "Is a bridge removable?",
        a: "No. A bridge is fixed in place and is cleaned like your natural teeth.",
      },
    ],
  },
  "dental-implants": {
    intro:
      "Dental implants are a long-term way to replace missing teeth. An implant acts like a new tooth root and supports a crown, bridge or denture that looks and feels natural.",
    whatToExpect: [
      "A consultation to check whether implants suit you",
      "Planning with X-rays to assess the bone",
      "Placement of the implant and a healing period",
      "Fitting of the final tooth or teeth",
    ],
    goodFor: ["One or more missing teeth", "Loose dentures", "People who want a fixed, natural-looking result"],
    faqs: [
      {
        q: "Am I suitable for dental implants?",
        a: "Most adults with healthy gums and enough jaw bone are suitable. The dentist will assess you at a consultation.",
      },
      {
        q: "How long does the implant process take?",
        a: "Usually a few months, because the implant needs time to bond with the bone before the final tooth is fitted.",
      },
    ],
  },
};

/** General content for services added later by the clinic. */
export function genericCopy(name: string, short: string): ServiceCopy {
  return {
    intro: `${short} Available at Ruwa Dental Center, 1780 Runyararo Road, Ruwa.`,
    whatToExpect: [
      "An examination and a clear explanation of your options",
      "Treatment planned around your comfort",
      "Aftercare advice and follow-up where needed",
    ],
    goodFor: [name],
    faqs: [],
  };
}
