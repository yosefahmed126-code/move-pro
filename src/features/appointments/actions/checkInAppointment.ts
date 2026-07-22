"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function checkInAppointment(
  appointmentId: number
) {
  await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status: "CHECKED_IN",
    },
  });

  revalidatePath("/schedule");
}