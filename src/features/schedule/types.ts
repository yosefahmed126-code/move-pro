import type { ScheduleAppointment } from "@/features/appointments/types";

export interface TherapistColumn {
  id: number;
  name: string;
}

export interface PatientOption {
  id: number;
  name: string;
  branchId: number;
  remaining: number;
  package: {
    name: string;
  } | null;
}

export interface ScheduleCellProps {
  appointment?: ScheduleAppointment;
}

export interface ScheduleGridProps {
  therapists: TherapistColumn[];
  appointments: ScheduleAppointment[];
  patients: PatientOption[];
}