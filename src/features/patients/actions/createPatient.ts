"use server";

import { prisma } from "@/lib/prisma";
import { patientSchema } from "../schemas/patient.schema";

export async function createPatient(data: {
  name: string;
  mobile: string;
  branchId: number;
  packageId: number;
  therapist?: string;
}) {
  const result = patientSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten(),
    };
  }

  const selectedPackage = await prisma.package.findUnique({
    where: {
      id: data.packageId,
    },
  });

  if (!selectedPackage) {
    return {
      success: false,
      message: "Package not found.",
    };
  }

  const lastPatient = await prisma.patient.findFirst({
    orderBy: {
      code: "desc",
    },
  });

  const lastCode = lastPatient
    ? parseInt(lastPatient.code, 10)
    : 0;

  const code = (lastCode + 1)
    .toString()
    .padStart(3, "0");

  await prisma.patient.create({
    data: {
      code,
      name: data.name,
      mobile: data.mobile,
      therapist: data.therapist || null,

      branch: {
        connect: {
          id: data.branchId,
        },
      },

      package: {
        connect: {
          id: data.packageId,
        },
      },

      remaining: selectedPackage.sessions,
      status: "Active",
    },
  });

  return {
    success: true,
  };
}