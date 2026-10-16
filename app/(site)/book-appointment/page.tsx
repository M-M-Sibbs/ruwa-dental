import type { Metadata } from "next";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db, services, doctors, branches, doctorServices } from "@/db";
import { BookingForm } from "@/components/BookingForm";
import { todayISO } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Book an appointment",
  description: "Request a dental appointment at Ruwa Dental Center. Choose a service, doctor, date and time.",
};

export default async function BookPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [svc, docs, brs, links] = await Promise.all([
    db
      .select({ id: services.id, name: services.name })
      .from(services)
      .where(eq(services.active, true))
      .orderBy(asc(services.sortOrder)),
    db
      .select({ id: doctors.id, name: doctors.fullName })
      .from(doctors)
      .where(and(eq(doctors.active, true), isNull(doctors.deletedAt)))
      .orderBy(asc(doctors.createdAt)),
    db.select({ id: branches.id, name: branches.name, address: branches.address }).from(branches),
    db.select().from(doctorServices),
  ]);

  return (
    <>
      <section className="bg-gradient-to-b from-accent-50 to-white">
        <div className="container-x pb-8 pt-14 md:pt-20">
          <p className="eyebrow">Appointments</p>
          <h1 className="h-display mt-4 text-4xl sm:text-5xl">Book your visit</h1>
          <p className="mt-4 max-w-xl text-muted">
            Tell us when you would like to come. Our team will confirm your final time and location.
          </p>
        </div>
      </section>
      <section className="pb-24">
        <div className="container-x">
          <BookingForm
            services={svc}
            doctors={docs}
            branches={brs}
            links={links}
            today={todayISO()}
            preset={{ serviceId: sp.service, doctorId: sp.doctor }}
          />
        </div>
      </section>
    </>
  );
}
