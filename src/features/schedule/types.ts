import type { ScheduleAppointment } from "@/features/appointments/types";

export interface TherapistWorkingHour {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface TherapistColumn {
  id: number;
  name: string;

  workingHours: TherapistWorkingHour[];
}

export interface PatientOption {
  id: number;
  code: string;
  name: string;

  patientPackageId: number;
  patientPackageCode: string;

  branchId: number;
  branchName: string;

  packageId: number;
  packageName: string;

  totalSessions: number;
  remainingSessions: number;

  allowedExcuses: number;
  usedExcuses: number;
}

export interface ScheduleCellProps {
  appointment?: ScheduleAppointment;
}

export interface ScheduleGridProps {
  therapists: TherapistColumn[];
  appointments: ScheduleAppointment[];
  patients: PatientOption[];

  selectedDate: string;
}