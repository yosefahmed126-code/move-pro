"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deletePatient(id: number) {
  await prisma.patient.delete({
    where: {
      id,
    },
  });

  revalidatePath("/patients");
}