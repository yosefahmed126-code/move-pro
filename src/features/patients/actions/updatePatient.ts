"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PatientSchema } from "@/lib/validators/patient";

interface UpdatePatientData {
  id: number;

  name: string;
  gender?: string;
  birthDate?: string;

  mobile: string;
  mobile2?: string;

  email?: string;
  nationalId?: string;
  address?: string;

  branchId: number;
  packageId: number | null;
  therapistId: number | null;
}

export async function updatePatient(data: UpdatePatientData) {
  const result = PatientSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten(),
    };
  }

  // Check duplicate mobile
  const existingPatient = await prisma.patient.findFirst({
    where: {
      mobile: data.mobile,
      NOT: {
        id: data.id,
      },
    },
  });

  if (existingPatient) {
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

      gender: data.gender || null,

      birthDate: data.birthDate
        ? new Date(data.birthDate)
        : null,

      mobile: data.mobile,

      mobile2: data.mobile2 || null,

      email: data.email || null,

      nationalId: data.nationalId || null,

      address: data.address || null,

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