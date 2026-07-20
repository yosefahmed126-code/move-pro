import { AppointmentCard } from "./AppointmentCard";
import type { ScheduleAppointment } from "@/features/appointments/types";

interface Props {
  appointment?: ScheduleAppointment;
}

export function ScheduleCell({ appointment }: Props) {
  if (!appointment) {
    return (
      <div className="h-16 cursor-pointer border-r border-b transition hover:bg-blue-50" />
    );
  }

  return (
    <div className="border-r border-b p-1">
      <AppointmentCard appointment={appointment} />
    </div>
  );
}