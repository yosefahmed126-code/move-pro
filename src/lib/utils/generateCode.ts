import { prisma } from "@/lib/prisma";

type CodeModel =
  | "patient"
  | "appointment"
  | "branch"
  | "therapist";

export async function generateCode(
  model: CodeModel,
  prefix: string
) {
  let lastId = 0;

  switch (model) {
    case "patient": {
      const lastRecord =
        await prisma.patient.findFirst({
          orderBy: {
            id: "desc",
          },
          select: {
            id: true,
          },
        });

      lastId = lastRecord?.id ?? 0;
      break;
    }

    case "appointment": {
      const lastRecord =
        await prisma.appointment.findFirst({
          orderBy: {
            id: "desc",
          },
          select: {
            id: true,
          },
        });

      lastId = lastRecord?.id ?? 0;
      break;
    }

    case "branch": {
      const lastRecord =
        await prisma.branch.findFirst({
          orderBy: {
            id: "desc",
          },
          select: {
            id: true,
          },
        });

      lastId = lastRecord?.id ?? 0;
      break;
    }

    case "therapist": {
      const lastRecord =
        await prisma.therapist.findFirst({
          orderBy: {
            id: "desc",
          },
          select: {
            id: true,
          },
        });

      lastId = lastRecord?.id ?? 0;
      break;
    }
  }

  const nextId = lastId + 1;

  return `${prefix}-${String(nextId).padStart(
    6,
    "0"
  )}`;
}