"use server";

import { prisma } from "@/lib/prisma";
import { PatientSchema } from "@/lib/validators/patient";

interface CreatePatientData {
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

export async function createPatient(data: CreatePatientData) {
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

  // Generate patient code
  const lastPatient = await prisma.patient.findFirst({
    orderBy: {
      id: "desc",
    },
  });

  const nextId = (lastPatient?.id ?? 0) + 1;
  const code = `MP-${String(nextId).padStart(4, "0")}`;

  await prisma.patient.create({
    data: {
      code,

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
        : undefined,

      remaining: selectedPackage.sessions,

      status: "Active",
    },
  });

  return {
    success: true,
    message: "Patient created successfully.",
  };
}