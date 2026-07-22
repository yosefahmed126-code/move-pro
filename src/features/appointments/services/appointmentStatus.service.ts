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
  });

  if (!appointment) {
    throw new Error("Appointment not found.");
  }

  await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status,
    },
  });

  return {
    success: true,
  };
}