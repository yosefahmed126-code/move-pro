import { prisma } from "@/lib/prisma";

export async function generateCode(
  model: "patient" | "appointment",
  prefix: string
) {
  const lastRecord =
    model === "patient"
      ? await prisma.patient.findFirst({
          orderBy: {
            id: "desc",
          },
        })
      : await prisma.appointment.findFirst({
          orderBy: {
            id: "desc",
          },
        });

  const nextId = (lastRecord?.id ?? 0) + 1;

  return `${prefix}-${String(nextId).padStart(6, "0")}`;
}