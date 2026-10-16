import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  await requireUser(["ADMIN"]);
  const { id: _id, createdAt: _c, updatedAt: _u, ...s } = await getSettings();
  return (
    <>
      <PageHeader title="Website CMS" subtitle="Update clinic identity, contact details, homepage message and social channels." />
      <SettingsForm initial={s} />
    </>
  );
}
