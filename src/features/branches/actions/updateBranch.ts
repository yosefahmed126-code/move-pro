"use server";

import { BranchStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

interface Data {
  id: number;
  name: string;
  status: BranchStatus;
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