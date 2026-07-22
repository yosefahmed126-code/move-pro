import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

interface ChangeAppointmentStatusParams {
  appointmentId: number;
  status: AppointmentStatus;
}

export async function changeAppointmentStatus({
  appointmentId,
  status,
}: ChangeAppointmentStatusParams) {
 const appointment = await prisma.appointment.findUnique({
  where: {
    id: appointmentId,
  },
  include: {
    patient: {
      include: {
        package: true,
      },
    },
  },
});

  if (!appointment) {
    throw new Error("Appointment not found.");
  }

if (
  status === AppointmentStatus.CHECKED_IN &&
  appointment.status !== AppointmentStatus.BOOKED
) {
  throw new Error("Only booked appointments can be checked in.");
}

if (
  status === AppointmentStatus.EXCUSED &&
  appointment.status !== AppointmentStatus.BOOKED
) {
  throw new Error("Only booked appointments can be excused.");
}

if (status === AppointmentStatus.EXCUSED) {
  const packageData = appointment.patient.package;

  if (!packageData) {
    throw new Error("Patient has no package.");
  }

  const remainingExcuses =
    packageData.allowedExcuses - appointment.patient.usedExcuses;

  if (remainingExcuses <= 0) {
    throw new Error("No excuses remaining.");
  }
}

const updatedAppointment = await prisma.appointment.update({
  where: {
    id: appointmentId,
  },
  data: {
    status,
    ...(status === AppointmentStatus.EXCUSED && {
      patient: {
        update: {
          usedExcuses: {
            increment: 1,
          },
        },
      },
    }),
  },
});

return updatedAppointment;

  
}