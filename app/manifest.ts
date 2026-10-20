import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ruwa Dental Center",
    short_name: "Ruwa Dental",
    description: "Dentist in Ruwa, Zimbabwe — open 24 hours.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1b3952",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
