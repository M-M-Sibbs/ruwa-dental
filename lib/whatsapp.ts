import "server-only";
import { waDigits } from "./phone";

export type BookingAlert = {
  trackingCode: string;
  patientName: string;
  phone: string;
  service: string;
  doctor: string;
  date: string;
  time: string;
  reason: string;
  adminUrl: string;
};

/** Text used both for the automatic alert and the patient's click-to-chat fallback. */
export function bookingText(b: BookingAlert, forClinic = true) {
  const lines = [
    forClinic ? "New appointment request — Ruwa Dental Center" : "Hello Ruwa Dental Center, I have just booked an appointment.",
    `Code: ${b.trackingCode}`,
    `Name: ${b.patientName}`,
    `Phone: ${b.phone}`,
    `Service: ${b.service}`,
    `Doctor: ${b.doctor}`,
    `Date: ${b.date} at ${b.time}`,
  ];
  if (b.reason) lines.push(`Reason: ${b.reason}`);
  if (forClinic) lines.push(`Open: ${b.adminUrl}`);
  return lines.join("\n");
}

export function waLink(number: string, text: string) {
  return `https://wa.me/${waDigits(number)}?text=${encodeURIComponent(text)}`;
}

/**
 * Sends the new-booking alert to the clinic through the WhatsApp Business
 * Cloud API. Returns true when Meta accepted the message.
 *
 * With WHATSAPP_TEMPLATE_NAME set, a pre-approved template is sent (needed
 * for business-initiated messages). Its body must have 8 variables in this
 * order: code, name, phone, service, doctor, date, time, reason.
 * Without it, a plain text message is sent, which Meta only delivers inside
 * a 24-hour customer-service window — fine for testing, not for production.
 */
export async function sendClinicBookingAlert(b: BookingAlert, clinicNumber: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = waDigits(process.env.CLINIC_WHATSAPP_TO || clinicNumber);
  if (!token || !phoneNumberId) return false;

  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  const body = template
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en" },
          components: [
            {
              type: "body",
              parameters: [b.trackingCode, b.patientName, b.phone, b.service, b.doctor, b.date, b.time, b.reason || "—"].map(
                (text) => ({ type: "text", text: text.slice(0, 200) }),
              ),
            },
          ],
        },
      }
    : { messaging_product: "whatsapp", to, type: "text", text: { body: bookingText(b) } };

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("WhatsApp alert failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("WhatsApp alert error", e);
    return false;
  }
}
