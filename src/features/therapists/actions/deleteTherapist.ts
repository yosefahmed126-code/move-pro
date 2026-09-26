"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function deleteTherapist(id: number) {
  const therapist = await prisma.therapist.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
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

  if (therapist._count.appointments > 0) {
    return {
      success: false,
      message:
        "Cannot delete therapist because it is linked to appointments.",
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
