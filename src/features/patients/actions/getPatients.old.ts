"use server";

import { prisma } from "@/lib/prisma";

export async function getPatients() {
  return prisma.patient.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      remaining: true,
      packageId: true,
    },
  });
}