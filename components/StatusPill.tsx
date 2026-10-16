import type { AppointmentStatus } from "@/db/schema";
import { STATUS_LABEL } from "@/lib/status";

const tone: Record<AppointmentStatus, string> = {
  REQUESTED: "bg-warning-bg text-warning",
  CONFIRMED: "bg-success-bg text-success",
  COMPLETED: "bg-accent-50 text-accent-700",
  CANCELLED: "bg-danger-bg text-danger",
  NO_SHOW: "bg-surface text-muted",
};

export function StatusPill({ status }: { status: AppointmentStatus }) {
  return <span className={`pill ${tone[status]}`}>{STATUS_LABEL[status]}</span>;
}
