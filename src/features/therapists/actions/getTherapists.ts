"use server";

import { prisma } from "@/lib/prisma";
import { therapistSchema } from "../schemas/therapist.schema";

export async function createTherapist(data: {
  name: string;
  mobile?: string;
  email?: string;
  specialty?: string;
  notes?: string;
  branchId: number;
}) {
  const result = therapistSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten(),
    };
  }

  await prisma.therapist.create({
    data: {
      name: data.name,

      mobile: data.mobile || null,

      email: data.email || null,

      specialty: data.specialty || null,

      notes: data.notes || null,

      status: "Active",

      branch: {
        connect: {
          id: data.branchId,
        },
      },
    },
  });

  return {
    success: true,
  };
}