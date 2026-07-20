import { APPOINTMENT_STATUS } from "@/features/appointments/constants";
import type { ScheduleAppointment } from "@/features/appointments/types";

interface Props {
  appointment: ScheduleAppointment;
}

export function AppointmentCard({
  appointment,
}: Props) {
  const appointmentStatus =
    APPOINTMENT_STATUS[appointment.status];

  return (
    <div
      className={`rounded-lg border-l-4 p-2 text-sm ${appointmentStatus.color}`}
    >
      <div className="truncate font-semibold">
        {appointment.patient.name}
      </div>

      <div className="mt-1 text-xs opacity-70">
        {appointmentStatus.label}
      </div>
    </div>
  );
}