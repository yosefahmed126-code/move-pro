"use server";

import { prisma } from "@/lib/prisma";
import { packageSchema } from "../schemas/package.schema";

interface UpdatePackageData {
  name: string;
  sessions: number;
  price: number;
  allowedExcuses: number;
  status: string;
}

export async function updatePackage(
  id: number,
  data: UpdatePackageData
) {
  const result = packageSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten(),
    };
  }

  const exists = await prisma.package.findFirst({
    where: {
      name: data.name,
      NOT: {
        id,
      },
    },
  });

  if (exists) {
    return {
      success: false,
      message: "Package name already exists.",
    };
  }

  await prisma.package.update({
    where: {
      id,
    },
    data: {
      name: data.name,
      sessions: data.sessions,
      price: data.price,
      allowedExcuses: data.allowedExcuses,
      status: data.status,
    },
  });

  return {
    success: true,
  };
}