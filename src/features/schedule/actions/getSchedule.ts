"use server";

import { prisma } from "@/lib/prisma";

export async function getSchedule() {
  const therapists = await prisma.therapist.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  const appointments = await prisma.appointment.findMany({
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
  });

  const patients = await prisma.patient.findMany({
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
  },
});

  return {
    therapists,
    appointments,
    patients,
  };
}