"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateAppointmentCode } from "@/lib/appointments/generateAppointmentCode";

import {
  appointmentSchema,
  AppointmentInput,
} from "../schemas/appointment.schema";

export async function createAppointment(data: AppointmentInput) {
  const parsed = appointmentSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("Invalid appointment data");
  }
const existingAppointment = await prisma.appointment.findFirst({
  where: {
    therapistId: parsed.data.therapistId,
    date: parsed.data.date,
    startTime: parsed.data.startTime,
  },
});

if (existingAppointment) {
  throw new Error(
    "This therapist already has an appointment at this time."
  );
}

  const code = await generateAppointmentCode();

await prisma.appointment.create({
  data: {
    ...parsed.data,
    code,
  },
});

  revalidatePath("/schedule");
}