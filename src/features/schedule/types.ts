import type { ScheduleAppointment } from "@/features/appointments/types";

export interface TherapistColumn {
  id: number;
  name: string;
}

export interface ScheduleCellProps {
  appointment?: ScheduleAppointment;
}

export interface ScheduleGridProps {
  therapists: TherapistColumn[];
  appointments: ScheduleAppointment[];
}