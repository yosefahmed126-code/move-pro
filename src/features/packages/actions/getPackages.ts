"use server";

import { prisma } from "@/lib/prisma";

export async function getPackages() {
  const packages = await prisma.package.findMany({
    include: {
      _count: {
        select: {
          patients: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  return packages.map((pkg) => ({
    ...pkg,
    patientsCount: pkg._count.patients,
  }));
}