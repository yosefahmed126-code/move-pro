import { AppointmentStatus } from "@prisma/client";

export const STATUS_COLORS: Record<
  AppointmentStatus,
  string
> = {
  BOOKED:
    "bg-yellow-100 text-yellow-800 border-yellow-400",

  CHECKED_IN:
    "bg-green-100 text-green-800 border-green-400",

  EXCUSED:
    "bg-blue-100 text-blue-800 border-blue-400",

  MISSED:
    "bg-red-100 text-red-800 border-red-400",

  CANCELLED_BY_MANAGER:
    "bg-slate-100 text-slate-700 border-slate-400",
};