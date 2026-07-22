"use server";

import { AppointmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { changeAppointmentStatus } from "../services/appointmentStatus.service";

export async function excuseAppointment(
  appointmentId: number
) {
  await changeAppointmentStatus({
    appointmentId,
    status: AppointmentStatus.EXCUSED,
  });

  revalidatePath("/schedule");
}