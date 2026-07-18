"use server";

import { prisma } from "@/lib/prisma";
import { patientSchema } from "../schemas/patient.schema";

interface CreatePatientData {
  name: string;
  mobile: string;
  branchId: number;
  packageId: number | null;
  therapistId: number | null;
}

export async function createPatient(data: CreatePatientData) {
  const result = patientSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten(),
    };
  }

  // Check duplicate mobile
  const existing = await prisma.patient.findFirst({
    where: {
      mobile: data.mobile,
    },
  });

  if (existing) {
    return {
      success: false,
      message: "Patient with this mobile number already exists.",
    };
  }

  // Get selected package
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

  // Generate patient code based on last id
  const lastPatient = await prisma.patient.findFirst({
    orderBy: {
      id: "desc",
    },
  });

  const nextId = (lastPatient?.id ?? 0) + 1;
  const code = `MP-${String(nextId).padStart(4, "0")}`;

  // Create patient
  await prisma.patient.create({
  data: {
    code,
    name: data.name,
    mobile: data.mobile,

    branch: {
      connect: {
        id: data.branchId,
      },
    },

    package: data.packageId
      ? {
          connect: {
            id: data.packageId,
          },
        }
      : undefined,

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
  };
}