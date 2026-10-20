import { WhatsApp } from "./Icons";

// Fixed "Chat on WhatsApp" button shown on every public page.
export function FloatingWhatsApp({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="Chat with Ruwa Dental Center on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-[0_10px_30px_-8px_rgb(0_0_0/0.45)] transition hover:bg-[#1fb958] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:bottom-6 sm:right-6 sm:px-5 sm:py-3.5"
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-25 motion-reduce:hidden sm:hidden" aria-hidden />
      <WhatsApp className="h-7 w-7 sm:h-6 sm:w-6" />
      <span className="hidden text-sm font-semibold sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
