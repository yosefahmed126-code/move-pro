"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { therapistSchema } from "../schemas/therapist.schema";

interface UpdateTherapistData {
  id: number;
  name: string;
  mobile?: string;
  email?: string;
  specialty?: string;
  notes?: string;
  branchId: number;

  workingHours: {
    dayOfWeek: number;
    enabled: boolean;
    startTime: string;
    endTime: string;
  }[];
}

export async function updateTherapist(
  data: UpdateTherapistData
) {
  /*
  |--------------------------------------------------------------------------
  | Validate Therapist ID
  |--------------------------------------------------------------------------
  */

  if (
    !Number.isInteger(data.id) ||
    data.id <= 0
  ) {
    return {
      success: false,
      message: "Invalid therapist.",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Validate Data
  |--------------------------------------------------------------------------
  */

  const result =
    therapistSchema.safeParse({
      name: data.name,
      mobile: data.mobile,
      email: data.email,
      specialty: data.specialty,
      notes: data.notes,
      branchId: data.branchId,
      workingHours:
        data.workingHours,
    });

  if (!result.success) {
    return {
      success: false,
      message:
        "Please check the entered therapist information.",
      errors:
        result.error.flatten(),
    };
  }

  const validatedData =
    result.data;

  try {
    /*
    |--------------------------------------------------------------------------
    | Check Therapist
    |--------------------------------------------------------------------------
    */

    const existingTherapist =
      await prisma.therapist.findUnique({
        where: {
          id: data.id,
        },

        select: {
          id: true,
        },
      });

    if (!existingTherapist) {
      return {
        success: false,
        message:
          "Therapist not found.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Update Therapist + Working Schedule
    |--------------------------------------------------------------------------
    */

    await prisma.$transaction(
      async (tx) => {
        await tx.therapist.update({
          where: {
            id: data.id,
          },

          data: {
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
        | Remove Previous Working Hours
        |--------------------------------------------------------------------------
        |
        | Replacing the schedule is simpler and safer than trying
        | to determine which individual days changed.
        |
        */

        await tx.therapistWorkingHour.deleteMany(
          {
            where: {
              therapistId:
                data.id,
            },
          }
        );

        /*
        |--------------------------------------------------------------------------
        | Create New Working Hours
        |--------------------------------------------------------------------------
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
                      data.id,

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

    /*
    |--------------------------------------------------------------------------
    | Refresh Pages
    |--------------------------------------------------------------------------
    */

    revalidatePath(
      "/therapists"
    );

    revalidatePath(
      `/therapists/${data.id}`
    );

    revalidatePath(
      `/therapists/${data.id}/edit`
    );

    revalidatePath(
      "/schedule"
    );

    return {
      success: true,
      message:
        "Therapist updated successfully.",
    };
  } catch (error) {
    console.error(
      "UPDATE_THERAPIST_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong while updating the therapist.",
    };
  }
}