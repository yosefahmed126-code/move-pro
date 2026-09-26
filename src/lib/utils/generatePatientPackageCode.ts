import { prisma } from "@/lib/prisma";

export async function generatePatientPackageCode() {
  const lastPatientPackage =
    await prisma.patientPackage.findFirst({
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
      },
    });

  const nextNumber =
    (lastPatientPackage?.id ?? 0) + 1;

  return `PP-${String(nextNumber).padStart(
    6,
    "0"
  )}`;
}