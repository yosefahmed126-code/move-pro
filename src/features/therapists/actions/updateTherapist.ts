"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { therapistSchema } from "../schemas/therapist.schema";

interface UpdateTherapistData {
  id: number;
  name: string;
  mobile?: string;
  email?: string;
  specialty?: string;
  notes?: string;
  branchId: number;
}

export async function updateTherapist(
  data: UpdateTherapistData
) {
  const result = therapistSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten(),
    };
  }

  await prisma.therapist.update({
    where: {
      id: data.id,
    },
    data: {
      name: data.name,
      mobile: data.mobile || null,
      email: data.email || null,
      specialty: data.specialty || null,
      notes: data.notes || null,

      branch: {
        connect: {
          id: data.branchId,
        },
      },
    },
  });

  revalidatePath("/therapists");
  revalidatePath(`/therapists/${data.id}`);

  return {
    success: true,
  };
}