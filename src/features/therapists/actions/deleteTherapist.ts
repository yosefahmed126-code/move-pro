"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteTherapist(id: number) {
  const therapist = await prisma.therapist.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          patients: true,
          appointments: true,
        },
      },
    },
  });

  if (!therapist) {
    return {
      success: false,
      message: "Therapist not found.",
    };
  }

  if (
    therapist._count.patients > 0 ||
    therapist._count.appointments > 0
  ) {
    return {
      success: false,
      message:
        "Cannot delete therapist because it is linked to patients or appointments.",
    };
  }

  await prisma.therapist.delete({
    where: {
      id,
    },
  });

  revalidatePath("/therapists");

  return {
    success: true,
  };
}