"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { patientSchema } from "../schemas/patient.schema";

interface UpdatePatientData {
  id: number;
  name: string;
  mobile: string;
  branchId: number;
  therapist?: string;
}

export async function updatePatient(data: UpdatePatientData) {
  const result = patientSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten(),
    };
  }

  await prisma.patient.update({
    where: {
      id: data.id,
    },
    data: {
      name: data.name,
      mobile: data.mobile,
      therapist: data.therapist || null,

      branch: {
        connect: {
          id: data.branchId,
        },
      },
    },
  });

  revalidatePath("/patients");
  revalidatePath(`/patients/${data.id}`);

  return {
    success: true,
  };
}