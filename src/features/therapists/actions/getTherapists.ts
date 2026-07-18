"use server";

import { prisma } from "@/lib/prisma";

export async function getTherapists() {
  const therapists = await prisma.therapist.findMany({
    include: {
      branch: true,
      _count: {
        select: {
          patients: true,
          appointments: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return therapists.map((therapist) => ({
    ...therapist,
    patientsCount: therapist._count.patients,
    appointmentsCount: therapist._count.appointments,
  }));
}