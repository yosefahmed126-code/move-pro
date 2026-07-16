"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface Data {
  name: string;
  status: string;
}

export async function createBranch(data: Data) {
  try {
    await prisma.branch.create({
      data: {
        name: data.name,
        status: data.status,
      },
    });

    revalidatePath("/branches");

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
    };
  }
}
