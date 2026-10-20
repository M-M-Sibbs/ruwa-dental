import Image from "next/image";
import Link from "next/link";

export function LogoMark({ size = 40, tile = false, alt = "" }: { size?: number; tile?: boolean; alt?: string }) {
  const img = <Image src="/brand/logo.png" alt={alt} width={size} height={size} priority />;
  if (!tile) return img;
  return <span className="inline-flex rounded-xl bg-white p-1 shadow-sm">{img}</span>;
}

export function Logo({ clinicName = "Ruwa Dental Center", light = false }: { clinicName?: string; light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${clinicName} home`}>
      <LogoMark size={light ? 36 : 42} tile={light} />
      <span className="leading-tight">
        <span className={`block text-[15px] font-bold tracking-tight ${light ? "text-white" : "text-ink"}`}>
          {clinicName}
        </span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[0.2em] ${light ? "text-white/60" : "text-muted"}`}>
          Dental clinic • Ruwa
        </span>
      </span>
    </Link>
  );
}
