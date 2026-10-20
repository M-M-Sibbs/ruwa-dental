import type { Metadata, Viewport } from "next";
import "./globals.css";
import { checkDatabase } from "@/db/prepare";
import { SetupNotice } from "@/components/SetupNotice";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dentist in Ruwa | Ruwa Dental Center — Open 24 Hours",
    template: "%s | Ruwa Dental Center",
  },
  description:
    "Ruwa Dental Center is a dentist in Ruwa, Zimbabwe, open 24 hours for check-ups, cleaning, fillings, root canals, extractions, dentures, crowns and implants. Medical aids accepted. Book online or WhatsApp.",
  keywords: [
    "dentist in Ruwa",
    "Ruwa dentist",
    "dental clinic Ruwa",
    "emergency dentist Ruwa",
    "24 hour dentist Zimbabwe",
    "dentist near Harare",
    "Ruwa Dental Center",
  ],
  applicationName: "Ruwa Dental Center",
  category: "health",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    type: "website",
    siteName: "Ruwa Dental Center",
    locale: "en_ZW",
    url: SITE_URL,
    title: "Dentist in Ruwa | Ruwa Dental Center — Open 24 Hours",
    description: "Family dental clinic in Ruwa, Zimbabwe. Open 24 hours, medical aids accepted. Book online or WhatsApp.",
  },
  twitter: { card: "summary_large_image" },
  verification: {
    // Paste the code from Google Search Console into this Vercel setting (see README).
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
  other: {
    "geo.region": "ZW-ME",
    "geo.placename": "Ruwa",
  },
};

export const viewport: Viewport = {
  themeColor: "#1b3952",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const problem = await checkDatabase();
  return (
    <html lang="en-ZW">
      <body>{problem ? <SetupNotice problem={problem} /> : children}</body>
    </html>
  );
}
