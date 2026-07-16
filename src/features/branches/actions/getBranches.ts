"use server";

import { prisma } from "@/lib/prisma";

export async function getBranches(search = "") {
  return prisma.branch.findMany({
    where: search
      ? {
          name: {
            contains: search,
          },
        }
      : {},
    orderBy: {
      id: "desc",
    },
  });
}