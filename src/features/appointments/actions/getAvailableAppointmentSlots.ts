"use server";

import {
  AppointmentStatus,
  TherapistStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
  requirePermission,
} from "@/lib/auth/permissions";

import {
  requireBranchAccess,
} from "@/lib/auth/requireBranchAccess";

import { generateTimeSlots } from "@/lib/appointments/timeSlots";

interface GetAvailableAppointmentSlotsInput {
  therapistId: number;
  date: string; // YYYY-MM-DD

  /*
   * During reschedule we exclude the current
   * appointment from the conflict check.
   */
  excludeAppointmentId?: number;
}

export async function getAvailableAppointmentSlots(
  input: GetAvailableAppointmentSlotsInput
) {
  await requirePermission(
    "appointments:update"
  );

  /*
  |--------------------------------------------------------------------------
  | Validate Input
  |--------------------------------------------------------------------------
  */

  if (
    !Number.isInteger(input.therapistId) ||
    input.therapistId <= 0
  ) {
    throw new Error(
      "Invalid therapist."
    );
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      input.date
    )
  ) {
    throw new Error(
      "Invalid appointment date."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Build Selected Date
  |--------------------------------------------------------------------------
  */

  const [year, month, day] =
    input.date
      .split("-")
      .map(Number);

  const selectedDate = new Date(
    year,
    month - 1,
    day,
    12,
    0,
    0,
    0
  );

  if (
    Number.isNaN(
      selectedDate.getTime()
    )
  ) {
    throw new Error(
      "Invalid appointment date."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Therapist
  |--------------------------------------------------------------------------
  */

  const therapist =
    await prisma.therapist.findUnique({
      where: {
        id: input.therapistId,
      },

      select: {
        id: true,
        branchId: true,
        status: true,

        workingHours: {
          where: {
            dayOfWeek:
              selectedDate.getDay(),
          },

          select: {
            startTime: true,
            endTime: true,
          },
        },
      },
    });

  if (!therapist) {
    throw new Error(
      "Therapist not found."
    );
  }

  if (
    therapist.status !==
    TherapistStatus.ACTIVE
  ) {
    throw new Error(
      "This therapist is not active."
    );
  }

  await requireBranchAccess(
    therapist.branchId
  );

  /*
  |--------------------------------------------------------------------------
  | No Working Hours
  |--------------------------------------------------------------------------
  */

  if (
    therapist.workingHours.length === 0
  ) {
    return {
      success: true,
      slots: [],
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Day Range
  |--------------------------------------------------------------------------
  */

  const dayStart = new Date(
    year,
    month - 1,
    day,
    0,
    0,
    0,
    0
  );

  const dayEnd = new Date(
    year,
    month - 1,
    day,
    23,
    59,
    59,
    999
  );

  /*
  |--------------------------------------------------------------------------
  | Existing Appointments
  |--------------------------------------------------------------------------
  */

  const appointments =
    await prisma.appointment.findMany({
      where: {
        therapistId:
          therapist.id,

        branchId:
          therapist.branchId,

        date: {
          gte: dayStart,
          lte: dayEnd,
        },

        status: {
          not:
            AppointmentStatus.CANCELLED_BY_MANAGER,
        },

        ...(input.excludeAppointmentId
          ? {
              id: {
                not:
                  input.excludeAppointmentId,
              },
            }
          : {}),
      },

      select: {
        startTime: true,
        endTime: true,
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Generate Available Slots
  |--------------------------------------------------------------------------
  */

  const allSlots =
    generateTimeSlots();

  const availableSlots =
    allSlots.filter((slot) => {
      const slotStartMinutes =
        timeToMinutes(slot);

      /*
       * Session duration is currently 40 minutes.
       */
      const slotEndMinutes =
        slotStartMinutes + 40;

      /*
      |--------------------------------------------------------------------------
      | Working Hours
      |--------------------------------------------------------------------------
      |
      | Support multiple working periods on the same day.
      |
      | Example:
      | 09:00 -> 13:00
      | 17:00 -> 21:00
      |
      */

      const insideWorkingHours =
        therapist.workingHours.some(
          (workingHour) => {
            const workStart =
              timeToMinutes(
                workingHour.startTime
              );

            const workEnd =
              timeToMinutes(
                workingHour.endTime
              );

            return (
              slotStartMinutes >=
                workStart &&
              slotEndMinutes <=
                workEnd
            );
          }
        );

      if (!insideWorkingHours) {
        return false;
      }

      /*
      |--------------------------------------------------------------------------
      | Appointment Conflict
      |--------------------------------------------------------------------------
      */

      const hasConflict =
        appointments.some(
          (appointment) => {
            const existingStart =
              appointment.startTime.getHours() *
                60 +
              appointment.startTime.getMinutes();

            const existingEnd =
              appointment.endTime.getHours() *
                60 +
              appointment.endTime.getMinutes();

            return (
              existingStart <
                slotEndMinutes &&
              existingEnd >
                slotStartMinutes
            );
          }
        );

      return !hasConflict;
    });

  return {
    success: true,
    slots: availableSlots,
  };
}

/*
|--------------------------------------------------------------------------
| Time To Minutes
|--------------------------------------------------------------------------
*/

function timeToMinutes(
  time: string
) {
  const [hours, minutes] =
    time.split(":").map(Number);

  return hours * 60 + minutes;
}