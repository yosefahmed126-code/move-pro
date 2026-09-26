"use server";

import { prisma } from "@/lib/prisma";

export async function getTherapists() {
  const therapists = await prisma.therapist.findMany({
    include: {
      branch: true,
      _count: {
  select: {
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
   patientsCount: 0,
   appointmentsCount: therapist._count.appointments,  }));
}