import { desc } from "drizzle-orm";
import { db, feedback } from "@/db";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/dates";
import { displayPhone } from "@/lib/phone";
import { PageHeader, Notice } from "@/components/admin/PageHeader";
import { Stars } from "@/components/Stars";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteFeedback, saveFeedback } from "@/app/actions/admin";

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  await requireUser(["ADMIN"]);
  const sp = await searchParams;
  const list = await db.select().from(feedback).orderBy(desc(feedback.createdAt));
  return (
    <>
      <PageHeader title="Feedback" subtitle="Review feedback submitted from the public website and choose what may appear publicly." />
      {sp.saved && <Notice>Feedback updated.</Notice>}
      {sp.deleted && <Notice>Feedback deleted.</Notice>}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-line bg-surface/60 text-left text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">From</th>
              <th className="px-5 py-3 font-semibold">Rating</th>
              <th className="px-5 py-3 font-semibold">Feedback</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-muted">No feedback yet.</td></tr>}
            {list.map((f) => (
              <tr key={f.id} className="align-top">
                <td className="px-5 py-4">
                  <p className="font-semibold">{f.name}</p>
                  <p className="text-xs text-muted">{[displayPhone(f.phone), f.email].filter(Boolean).join(" · ")}</p>
                  <p className="text-xs text-muted">{formatDateTime(f.createdAt)}</p>
                </td>
                <td className="px-5 py-4"><Stars rating={f.rating} /></td>
                <td className="max-w-sm px-5 py-4 whitespace-pre-line">{f.message}</td>
                <td className="px-5 py-4">
                  <span className={`pill ${f.published ? "bg-success-bg text-success" : f.reviewed ? "bg-accent-50 text-accent-700" : "bg-warning-bg text-warning"}`}>
                    {f.published ? "Reviewed · Published" : f.reviewed ? "Reviewed · Private" : "New · Private"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <form action={saveFeedback} className="flex flex-col gap-2">
                    <input type="hidden" name="id" value={f.id} />
                    <label className="flex items-center gap-2"><input type="checkbox" name="reviewed" defaultChecked={f.reviewed} className="h-4 w-4 accent-[#4fa8e2]" /> Reviewed</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={f.published} className="h-4 w-4 accent-[#4fa8e2]" /> Publish</label>
                    <button className="btn-primary w-fit px-4 py-1.5">Save</button>
                  </form>
                  <form action={deleteFeedback} className="mt-2">
                    <input type="hidden" name="id" value={f.id} />
                    <ConfirmButton message="Delete this feedback permanently?">Delete</ConfirmButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
