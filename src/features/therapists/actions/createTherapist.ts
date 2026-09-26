"use server";

import {
  TherapistStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { generateCode } from "@/lib/utils/generateCode";
import { therapistSchema } from "../schemas/therapist.schema";

export async function createTherapist(
  data: unknown
) {
  const result =
    therapistSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors:
        result.error.flatten(),
    };
  }

  try {
    const code =
      await generateCode(
        "therapist",
        "TH"
      );

    const validatedData =
      result.data;

    await prisma.$transaction(
      async (tx) => {
        /*
        |--------------------------------------------------------------------------
        | Create Therapist
        |--------------------------------------------------------------------------
        */

        const therapist =
          await tx.therapist.create({
            data: {
              code,

              name:
                validatedData.name,

              mobile:
                validatedData.mobile
                  ?.trim() ||
                null,

              email:
                validatedData.email
                  ?.trim() ||
                null,

              specialty:
                validatedData.specialty
                  ?.trim() ||
                null,

              notes:
                validatedData.notes
                  ?.trim() ||
                null,

              status:
                TherapistStatus.ACTIVE,

              branch: {
                connect: {
                  id:
                    validatedData.branchId,
                },
              },
            },
          });

        /*
        |--------------------------------------------------------------------------
        | Create Working Hours
        |--------------------------------------------------------------------------
        |
        | Only enabled days are saved.
        |
        */

        const enabledWorkingHours =
          validatedData.workingHours.filter(
            (workingHour) =>
              workingHour.enabled
          );

        if (
          enabledWorkingHours.length >
          0
        ) {
          await tx.therapistWorkingHour.createMany(
            {
              data:
                enabledWorkingHours.map(
                  (
                    workingHour
                  ) => ({
                    therapistId:
                      therapist.id,

                    dayOfWeek:
                      workingHour.dayOfWeek,

                    startTime:
                      workingHour.startTime,

                    endTime:
                      workingHour.endTime,
                  })
                ),
            }
          );
        }
      }
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "CREATE_THERAPIST_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong while creating the therapist.",
    };
  }
}