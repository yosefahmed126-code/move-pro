"use server";

import { prisma } from "@/lib/prisma";
import { calculateEndTime } from "@/lib/appointments/time";
import { isTherapistAvailable } from "@/lib/appointments/availability";

import {
  AppointmentSchema,
  type AppointmentFormData,
} from "../schemas/appointment.schema";

export async function createAppointment(
  data: AppointmentFormData
) {
  const result = AppointmentSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten(),
    };
  }

  const patient = await prisma.patient.findUnique({
    where: {
      id: data.patientId,
    },
  });

  if (!patient) {
    return {
      success: false,
      message: "Patient not found.",
    };
  }

  const therapist = await prisma.therapist.findUnique({
    where: {
      id: data.therapistId,
    },
  });

  if (!therapist) {
    return {
      success: false,
      message: "Therapist not found.",
    };
  }

  const branch = await prisma.branch.findUnique({
    where: {
      id: data.branchId,
    },
  });

  if (!branch) {
    return {
      success: false,
      message: "Branch not found.",
    };
  }

  const startTime = new Date(`${data.date}T${data.startTime}`);
  
  const endTime = calculateEndTime(
  startTime,
  data.duration
);
 const available = await isTherapistAvailable(
  data.therapistId,
  startTime,
  endTime
);

if (!available) {
  return {
    success: false,
    message: "This time slot is already booked.",
  };
}

const lastAppointment = await prisma.appointment.findFirst({
  orderBy: {
    id: "desc",
  },
});

const nextId = (lastAppointment?.id ?? 0) + 1;

const code = `AP-${String(nextId).padStart(6, "0")}`;

const appointment = await prisma.appointment.create({
  data: {
    code,

    patientId: data.patientId,

    therapistId: data.therapistId,

    branchId: data.branchId,

    date: new Date(data.date),

    startTime,

    endTime,

    duration: data.duration,

    notes: data.notes,
  },
});

return {
  success: true,
  message: "Appointment created successfully.",
  appointment,
}; 
}