import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const patients = await prisma.patient.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return NextResponse.json(patients);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const patient = await prisma.patient.create({
      data: {
        code: body.code,
        name: body.name,
        mobile: body.mobile,
        branch: body.branch,
        therapist: body.therapist || null,
        package: body.package || null,
        remaining: body.remaining || 0,
        status: body.status || "Active",
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to create patient." },
      { status: 500 }
    );
  }
}