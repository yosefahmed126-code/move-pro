"use server";

import {
  AppointmentStatus,
  TherapistStatus,
} from "@prisma/client";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import {
  requirePermission,
} from "@/lib/auth/permissions";

import {
  requireBranchAccess,
} from "@/lib/auth/requireBranchAccess";

interface RescheduleAppointmentInput {
  appointmentId: number;
  therapistId: number;

  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
}

export async function rescheduleAppointment(
  input: RescheduleAppointmentInput
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
    !Number.isInteger(input.appointmentId) ||
    input.appointmentId <= 0
  ) {
    throw new Error(
      "Invalid appointment."
    );
  }

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

  if (
    !/^\d{2}:\d{2}$/.test(
      input.startTime
    )
  ) {
    throw new Error(
      "Invalid appointment time."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Current Appointment
  |--------------------------------------------------------------------------
  */

  const appointment =
    await prisma.appointment.findUnique({
      where: {
        id: input.appointmentId,
      },

      include: {
        patientPackage: true,
      },
    });

  if (!appointment) {
    throw new Error(
      "Appointment not found."
    );
  }
  await requireBranchAccess(
  appointment.branchId
);

  /*
  |--------------------------------------------------------------------------
  | Only BOOKED appointments can be rescheduled
  |--------------------------------------------------------------------------
  */

  if (
    appointment.status !==
    AppointmentStatus.BOOKED
  ) {
    throw new Error(
      "Only booked appointments can be rescheduled."
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
  if (
  therapist.branchId !==
  appointment.branchId
) {
  throw new Error(
    "Therapist does not belong to this appointment branch."
  );
}

  /*
  |--------------------------------------------------------------------------
  | Build Date / Time
  |--------------------------------------------------------------------------
  */

  const [year, month, day] =
    input.date
      .split("-")
      .map(Number);

  const [hours, minutes] =
    input.startTime
      .split(":")
      .map(Number);

      if (
  !Number.isInteger(hours) ||
  !Number.isInteger(minutes) ||
  hours < 0 ||
  hours > 23 ||
  minutes < 0 ||
  minutes > 59
) {
  throw new Error(
    "Invalid appointment time."
  );
}

  const appointmentDate = new Date(
    year,
    month - 1,
    day,
    0,
    0,
    0,
    0
  );

  const startTime = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    0,
    0
  );

  const endTime = new Date(
    startTime
  );

  endTime.setMinutes(
    endTime.getMinutes() +
      appointment.duration
  );

  if (
    Number.isNaN(
      appointmentDate.getTime()
    ) ||
    Number.isNaN(startTime.getTime()) ||
    Number.isNaN(endTime.getTime())
  ) {
    throw new Error(
      "Invalid appointment date or time."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Day Range
  |--------------------------------------------------------------------------
  */

  const dayStart = new Date(
    appointmentDate
  );

  dayStart.setHours(
    0,
    0,
    0,
    0
  );

  const dayEnd = new Date(
    appointmentDate
  );

  dayEnd.setHours(
    23,
    59,
    59,
    999
  );

  /*
  |--------------------------------------------------------------------------
  | Check Therapist Conflict
  |--------------------------------------------------------------------------
  */

  const conflict =
    await prisma.appointment.findFirst({
      where: {
  id: {
    not: appointment.id,
  },

  branchId:
    appointment.branchId,

  therapistId:
    input.therapistId,


        date: {
          gte: dayStart,
          lte: dayEnd,
        },

        status: {
          not:
            AppointmentStatus.CANCELLED_BY_MANAGER,
        },

        startTime: {
          lt: endTime,
        },

        endTime: {
          gt: startTime,
        },
      },

      select: {
        id: true,
        code: true,
      },
    });

  if (conflict) {
    throw new Error(
      "This therapist already has an appointment during this time."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Update Appointment
  |--------------------------------------------------------------------------
  |
  | We intentionally DO NOT change:
  |
  | patientPackageId
  | sessionNumber
  | branchId
  | status
  |
  */

  await prisma.appointment.update({
    where: {
      id: appointment.id,
    },

    data: {
      therapistId:
        input.therapistId,

      date: appointmentDate,

      startTime,

      endTime,
    },
  });

  /*
  |--------------------------------------------------------------------------
  | Revalidate
  |--------------------------------------------------------------------------
  */

  revalidatePath("/schedule");

  revalidatePath(
    `/patients/${appointment.patientPackage.patientId}`
  );

  return {
    success: true,
    message:
      "Appointment rescheduled successfully.",
  };
}