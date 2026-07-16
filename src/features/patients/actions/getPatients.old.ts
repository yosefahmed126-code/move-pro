"use server";

import { prisma } from "@/lib/prisma";

export async function getPatients(search = "") {
  return prisma.patient.findMany({
    where: search
      ? {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              mobile: {
                contains: search,
              },
            },
            {
              code: {
                contains: search,
              },
            },
          ],
        }
      : {},
    orderBy: {
      id: "desc",
    },
  });
}