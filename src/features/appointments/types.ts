import { AppointmentStatus } from "@prisma/client";

export interface ScheduleAppointment {
  id: number;

  therapistId: number;

  patientId: number;

  branchId: number;

  startTime: Date | string;

  endTime: Date | string;

  status: AppointmentStatus;

  patient: {
    id: number;
    name: string;
  };

  therapist: {
    id: number;
    name: string;
  };

  branch: {
    id: number;
    name: string;
  };
}