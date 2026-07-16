"use server";

import { prisma } from "@/lib/prisma";
import { patientSchema } from "../schemas/patient.schema";

export async function createPatient(data: {
  name: string;
  mobile: string;
  branchId: number;
  therapist?: string;
}) {
  const result = patientSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten(),
    };
  }

  const lastPatient = await prisma.patient.findFirst({
    orderBy: {
      id: "desc",
    },
  });

  const nextNumber = (lastPatient?.id ?? 0) + 1;

  const code = `MP-${nextNumber.toString().padStart(4, "0")}`;

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

      remaining: 0,
      status: "Active",
    },
  });

  return {
    success: true,
  };
}