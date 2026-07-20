import { prisma } from "@/lib/prisma";

export async function isTherapistAvailable(
  therapistId: number,
  startTime: Date,
  endTime: Date
) {
  const appointment = await prisma.appointment.findFirst({
    where: {
      therapistId,

      status: {
        in: ["BOOKED", "CHECKED_IN"],
      },

      AND: [
        {
          startTime: {
            lt: endTime,
          },
        },
        {
          endTime: {
            gt: startTime,
          },
        },
      ],
    },
  });

  return !appointment;
}