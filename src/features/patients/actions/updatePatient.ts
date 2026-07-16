"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { patientSchema } from "../schemas/patient.schema";

interface UpdatePatientData {
  id: number;
  name: string;
  mobile: string;
  branch: string;
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
      branch: data.branch,
      therapist: data.therapist || null,
    },
  });

  revalidatePath("/patients");
  revalidatePath(`/patients/${data.id}`);

  return {
    success: true,
  };
}