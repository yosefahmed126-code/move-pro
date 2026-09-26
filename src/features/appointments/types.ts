import { AppointmentStatus } from "@prisma/client";

export interface ScheduleAppointment {
  id: number;
  code: string;

  patientPackageId: number;
  therapistId: number;
  branchId: number;

  sessionNumber: number;

  date: Date | string;
  startTime: Date | string;
  endTime: Date | string;

  duration: number;

  status: AppointmentStatus;

  notes: string | null;

  patient: {
    id: number;
    name: string;
    code: string;
  };

  therapist: {
    id: number;
    name: string;
  };

  branch: {
    id: number;
    name: string;
  };

  patientPackage: {
    id: number;
    code: string;

    totalSessions: number;
    remainingSessions: number;

    allowedExcuses: number;
    usedExcuses: number;

    status: string;

    package: {
      id: number;
      name: string;
    };
  };
}