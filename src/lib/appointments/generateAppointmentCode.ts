import { prisma } from "@/lib/prisma";

export async function generateAppointmentCode() {
  const lastAppointment = await prisma.appointment.findFirst({
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
    },
  });

  const nextId = (lastAppointment?.id ?? 0) + 1;

  return `AP-${nextId.toString().padStart(6, "0")}`;
}