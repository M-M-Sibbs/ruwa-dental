import { asc } from "drizzle-orm";
import { db, services } from "@/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/PageHeader";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { moveService } from "@/app/actions/admin";

export default async function ServicesPage() {
  await requireUser(["ADMIN"]);
  const list = await db.select().from(services).orderBy(asc(services.sortOrder), asc(services.name));
  return (
    <>
      <PageHeader title="Services" subtitle="Manage the services patients see on the website." />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <section className="card h-fit p-6">
          <ul className="divide-y divide-line">
            {list.map((s, i) => (
              <li key={s.id} className="py-4">
                <details>
                  <summary className="flex cursor-pointer list-none items-start gap-3">
                    <span className="flex-1">
                      <span className="block font-semibold">
                        {s.name}
                        {!s.active && <span className="pill ml-2 bg-surface text-muted">Hidden</span>}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted">{s.shortDescription}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <form action={moveService}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="dir" value="up" />
                        <button disabled={i === 0} className="rounded-lg px-2 py-1 text-muted hover:bg-surface disabled:opacity-30" aria-label={`Move ${s.name} up`}>↑</button>
                      </form>
                      <form action={moveService}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="dir" value="down" />
                        <button disabled={i === list.length - 1} className="rounded-lg px-2 py-1 text-muted hover:bg-surface disabled:opacity-30" aria-label={`Move ${s.name} down`}>↓</button>
                      </form>
                      <span className="link ml-2 text-sm">Edit</span>
                    </span>
                  </summary>
                  <div className="mt-4 rounded-xl bg-surface p-4">
                    <ServiceForm
                      initial={{
                        id: s.id,
                        name: s.name,
                        shortDescription: s.shortDescription,
                        fullDescription: s.fullDescription ?? "",
                        price: s.price ?? "",
                        active: s.active,
                      }}
                    />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>
        <section className="card h-fit p-6">
          <h2 className="mb-5 text-2xl font-bold tracking-tight">Add service</h2>
          <ServiceForm />
        </section>
      </div>
    </>
  );
}
