"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { patientSchema } from "../schemas/patient.schema";

interface UpdatePatientData {
  id: number;
  name: string;
  mobile: string;
  branchId: number;
  packageId: number | null;
  therapistId: number | null;
}

export async function updatePatient(data: UpdatePatientData) {
  const result = patientSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten(),
    };
  }

  // منع تكرار رقم الموبايل
  const existing = await prisma.patient.findFirst({
    where: {
      mobile: data.mobile,
      NOT: {
        id: data.id,
      },
    },
  });

  if (existing) {
    return {
      success: false,
      message: "Patient with this mobile number already exists.",
    };
  }

  if (!data.packageId) {
    return {
      success: false,
      message: "Please select a package.",
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

  await prisma.patient.update({
    where: {
      id: data.id,
    },
    data: {
      name: data.name,
      mobile: data.mobile,

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

      therapist: data.therapistId
        ? {
            connect: {
              id: data.therapistId,
            },
          }
        : {
            disconnect: true,
          },

      remaining: selectedPackage.sessions,
    },
  });

  revalidatePath("/patients");
  revalidatePath(`/patients/${data.id}`);

  return {
    success: true,
    message: "Patient updated successfully.",
  };
}