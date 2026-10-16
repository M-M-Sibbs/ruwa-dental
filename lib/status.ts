import type { AppointmentStatus } from "@/db/schema";

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  REQUESTED: "Requested",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
};

export const STATUS_ORDER: AppointmentStatus[] = ["REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];
