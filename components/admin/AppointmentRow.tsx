"use client";
import Link from "next/link";
import { useActionState } from "react";
import { updateAppointment } from "@/app/actions/admin";
import type { FormState } from "@/app/actions/public";
import { StatusPill } from "@/components/StatusPill";
import { SubmitButton } from "@/components/SubmitButton";
import { STATUS_LABEL, STATUS_ORDER } from "@/lib/status";
import type { AppointmentStatus } from "@/db/schema";

type Row = {
  id: string;
  code: string;
  patientId: string;
  patient: string;
  phone: string;
  date: string;
  dateLabel: string;
  time: string;
  confirmedTime: string;
  doctorId: string;
  status: AppointmentStatus;
  note: string;
  reason: string;
  service: string;
  branch: string;
  createdAt: string;
  whatsapp: boolean;
};

export function AppointmentRow({
  row,
  doctors,
  canAssign,
}: {
  row: Row;
  doctors: { id: string; name: string }[];
  canAssign: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(updateAppointment, {});
  const fid = `f-${row.id}`;
  return (
    <tr className="align-top">
      <td className="px-5 py-4">
        <Link href={`/admin/patients/${row.patientId}`} className="font-semibold text-accent-700 hover:underline">{row.patient}</Link>
        <p className="text-xs text-muted">{row.phone}</p>
        <p className="font-mono text-xs text-muted">{row.code}</p>
      </td>
      <td className="px-5 py-4">
        <p className="font-medium">{row.dateLabel}</p>
        <p className="text-xs text-muted">{row.time} · {row.branch}</p>
        <p className="mt-1 text-[11px] text-muted" title="Booked">Booked {row.createdAt}{row.whatsapp ? " · WhatsApp sent" : ""}</p>
      </td>
      <td className="max-w-[220px] px-5 py-4">
        <p>{row.service}</p>
        {row.reason && <p className="mt-1 text-xs text-muted">“{row.reason}”</p>}
      </td>
      <td className="px-5 py-4">
        <form id={fid} action={action} className="grid w-[340px] grid-cols-2 gap-2">
          <input type="hidden" name="id" value={row.id} />
          <select name="doctorId" defaultValue={row.doctorId} className="input col-span-2 py-2" disabled={!canAssign} aria-label="Doctor">
            <option value="">Unassigned</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input type="date" name="preferredDate" defaultValue={row.date} className="input py-2" aria-label="Date" />
          <input type="time" name="confirmedTime" defaultValue={row.confirmedTime || row.time} className="input py-2" aria-label="Confirmed time" />
          <select name="status" defaultValue={row.status} className="input col-span-2 py-2" aria-label="Status">
            {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <input name="clinicNote" defaultValue={row.note} placeholder="Note to patient (shown on tracking page)" className="input col-span-2 py-2" />
          <div className="col-span-2 flex items-center gap-3">
            <SubmitButton className="btn-soft flex-1 py-2" pendingText="Saving…">Save</SubmitButton>
            {state.message && (
              <span className={`text-xs font-medium ${state.ok ? "text-success" : "text-danger"}`} role="status">
                {state.ok ? "✓ " : ""}{state.message}
              </span>
            )}
          </div>
        </form>
      </td>
      <td className="px-5 py-4"><StatusPill status={row.status} /></td>
    </tr>
  );
}
