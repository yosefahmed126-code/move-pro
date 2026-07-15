import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load patients." },
      { status: 500 }
    );
  }
}