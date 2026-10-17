import type { Metadata, Viewport } from "next";
import "./globals.css";
import { checkDatabase } from "@/db/prepare";
import { SetupNotice } from "@/components/SetupNotice";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ruwadental.co.zw";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ruwa Dental Center — Dentist in Ruwa, Zimbabwe",
    template: "%s · Ruwa Dental Center",
  },
  description:
    "Professional dental care for the whole family in Ruwa. Exams, cleaning, fillings, root canals, dentures, crowns and implants. Open 24 hours, every day. Book online.",
  openGraph: {
    type: "website",
    siteName: "Ruwa Dental Center",
    locale: "en_ZW",
    images: [{ url: "/brand/logo.png", width: 512, height: 512, alt: "Ruwa Dental Center logo" }],
  },
  twitter: { card: "summary" },
};

export const viewport: Viewport = {
  themeColor: "#1b3952",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const problem = await checkDatabase();
  return (
    <html lang="en">
      <body>{problem ? <SetupNotice problem={problem} /> : children}</body>
    </html>
  );
}
