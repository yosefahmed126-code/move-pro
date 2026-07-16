"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface Data {
  id: number;
  name: string;
  status: string;
}

export async function updateBranch(data: Data) {
  try {
    await prisma.branch.update({
      where: {
        id: data.id,
      },
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
