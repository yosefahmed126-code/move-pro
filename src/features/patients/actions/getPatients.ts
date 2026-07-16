"use server";

import { prisma } from "@/lib/prisma";

export async function getPatients(
  search = "",
  page = 1,
  limit = 10
) {
  const skip = (page - 1) * limit;

  const where = search
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
    : {};

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.patient.count({
      where,
    }),
  ]);

  return {
    patients,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}