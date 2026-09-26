"use server";

import { BranchStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { generateCode } from "@/lib/utils/generateCode";

interface Data {
  name: string;
  status: BranchStatus;
}

export async function createBranch(data: Data) {
  try {
    const code = await generateCode(
      "branch",
      "BR"
    );

    await prisma.branch.create({
      data: {
        code,
        name: data.name,
        status: data.status,
      },
    });

    revalidatePath("/branches");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
    };
  }
}