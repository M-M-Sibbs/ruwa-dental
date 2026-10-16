import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const ALL = [
  { href: "/admin", label: "Dashboard", icon: "⌂", roles: ["ADMIN", "DOCTOR", "RECEPTION"] },
  { href: "/admin/appointments", label: "Appointments", icon: "◷", roles: ["ADMIN", "DOCTOR", "RECEPTION"] },
  { href: "/admin/patients", label: "Patients", icon: "♙", roles: ["ADMIN", "DOCTOR", "RECEPTION"] },
  { href: "/admin/doctors", label: "Doctors", icon: "✚", roles: ["ADMIN"] },
  { href: "/admin/services", label: "Services", icon: "✦", roles: ["ADMIN"] },
  { href: "/admin/feedback", label: "Feedback", icon: "★", roles: ["ADMIN"] },
  { href: "/admin/settings", label: "Website CMS", icon: "⚙", roles: ["ADMIN"] },
];

const ROLE_LABEL = { ADMIN: "Administrator", DOCTOR: "Doctor", RECEPTION: "Reception" } as const;

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const s = await getSettings();
  const items = ALL.filter((i) => i.roles.includes(user.role)).map(({ roles: _r, ...i }) => i);
  return (
    <AdminShell items={items} userName={user.name} roleLabel={ROLE_LABEL[user.role]} clinicName={s.clinicName}>
      {children}
    </AdminShell>
  );
}
