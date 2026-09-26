"use server";

import { PackageStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { packageSchema } from "../schemas/package.schema";

interface CreatePackageData {
  name: string;
  sessions: number;
  price: number;
  allowedExcuses: number;
  status: PackageStatus;
}

export async function createPackage(
  data: CreatePackageData
) {
  const result =
    packageSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors:
        result.error.flatten(),
    };
  }

  const exists =
    await prisma.package.findFirst({
      where: {
        name: data.name,
      },
    });

  if (exists) {
    return {
      success: false,
      message:
        "Package already exists.",
    };
  }

  await prisma.package.create({
    data: {
      name: data.name,
      sessions: data.sessions,
      price: data.price,
      allowedExcuses:
        data.allowedExcuses,
      status: data.status,
    },
  });

  return {
    success: true,
  };
}