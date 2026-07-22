"use server";

import { prisma } from "@/lib/prisma";

export async function getSchedule(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },

    include: {
      patient: {
        select: {
          id: true,
          name: true,
        },
      },

      therapist: {
        select: {
          id: true,
          name: true,
        },
      },

      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    orderBy: {
      startTime: "asc",
    },
  });

console.log(JSON.stringify(appointments, null, 2));

return {
  therapists,
  appointments,
  patients: await prisma.patient.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
  id: true,
  name: true,
  branchId: true,
  remaining: true,
  package: {
    select: {
      name: true,
    },
  },
}