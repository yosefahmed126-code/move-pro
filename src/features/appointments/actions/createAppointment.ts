"use server";

import {
  AppointmentStatus,
  PatientPackageStatus,
} from "@prisma/client";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { generateAppointmentCode } from "@/lib/appointments/generateAppointmentCode";

import {
  requirePermission,
} from "@/lib/auth/permissions";

import {
  requireBranchAccess,
} from "@/lib/auth/requireBranchAccess";

import {
  appointmentSchema,
  AppointmentInput,
} from "../schemas/appointment.schema";

export async function createAppointment(
  data: AppointmentInput
) {
  const user =
  await requirePermission(
    "appointments:create"
  );
  /*
  |--------------------------------------------------------------------------
  | Validate Input
  |--------------------------------------------------------------------------
  */

  const parsed =
    appointmentSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error(
      "Invalid appointment data."
    );
  }

  const appointmentData = parsed.data;

  /*
  |--------------------------------------------------------------------------
  | Validate Time
  |--------------------------------------------------------------------------
  */

  if (
    appointmentData.endTime <=
    appointmentData.startTime
  ) {
    throw new Error(
      "Appointment end time must be after start time."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Patient Package
  |--------------------------------------------------------------------------
  */

  const patientPackage =
    await prisma.patientPackage.findUnique({
      where: {
        id: appointmentData.patientPackageId,
      },

      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },

        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  if (!patientPackage) {
    throw new Error(
      "Patient package not found."
    );
  }

  if (
    patientPackage.status !==
    PatientPackageStatus.ACTIVE
  ) {
    throw new Error(
      "Patient package is not active."
    );
  }

  if (
    patientPackage.remainingSessions <= 0
  ) {
    throw new Error(
      "Patient has no remaining sessions."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Branch Validation
  |--------------------------------------------------------------------------
  |
  | Appointment must use the branch assigned to
  | the active PatientPackage.
  |
  */

  if (
    appointmentData.branchId !==
    patientPackage.branchId
  ) {
    throw new Error(
      "Appointment branch does not match the patient's active package."
    );
  }
  await requireBranchAccess(
  patientPackage.branchId
);

  /*
  |--------------------------------------------------------------------------
  | Therapist
  |--------------------------------------------------------------------------
  */

    /*
  |--------------------------------------------------------------------------
  | Therapist
  |--------------------------------------------------------------------------
  |
  | Therapist must:
  | - Exist
  | - Be ACTIVE
  | - Belong to the same branch as the PatientPackage
  |--------------------------------------------------------------------------
  */

  const therapist =
    await prisma.therapist.findFirst({
      where: {
        id:
          appointmentData.therapistId,

        branchId:
          patientPackage.branchId,

        status: "ACTIVE",
      },

      select: {
        id: true,
        status: true,
        branchId: true,
      },
    });

  if (!therapist) {
    throw new Error(
      "Therapist not found or does not belong to this branch."
    );
  }

/*
|--------------------------------------------------------------------------
| Therapist Working Hours
|--------------------------------------------------------------------------
|
| Appointment must be completely inside the therapist's
| working hours for the selected day.
|
*/

const appointmentDayOfWeek =
  appointmentData.date.getDay();

const workingHour =
  await prisma.therapistWorkingHour.findUnique({
    where: {
      therapistId_dayOfWeek: {
        therapistId:
          appointmentData.therapistId,

        dayOfWeek:
          appointmentDayOfWeek,
      },
    },

    select: {
      startTime: true,
      endTime: true,
    },
  });

/*
|--------------------------------------------------------------------------
| Therapist Not Working This Day
|--------------------------------------------------------------------------
*/

if (!workingHour) {
  throw new Error(
    "This therapist is not working on the selected day."
  );
}

/*
|--------------------------------------------------------------------------
| Convert Times To Minutes
|--------------------------------------------------------------------------
|
| Working hours are stored as strings:
|
| 15:00
| 23:00
|
| Appointment times are Date objects.
|
*/

const workingStartMinutes =
  timeStringToMinutes(
    workingHour.startTime
  );

const workingEndMinutes =
  timeStringToMinutes(
    workingHour.endTime
  );

const appointmentStartMinutes =
  appointmentData.startTime.getHours() *
    60 +
  appointmentData.startTime.getMinutes();

const appointmentEndMinutes =
  appointmentData.endTime.getHours() *
    60 +
  appointmentData.endTime.getMinutes();

/*
|--------------------------------------------------------------------------
| Validate Working Hours
|--------------------------------------------------------------------------
*/

if (
  appointmentStartMinutes <
    workingStartMinutes ||
  appointmentEndMinutes >
    workingEndMinutes
) {
  throw new Error(
    "Appointment must be within the therapist's working hours."
  );
}

  /*
  |--------------------------------------------------------------------------
  | Check Therapist Time Conflict
  |--------------------------------------------------------------------------
  |
  | This checks for overlapping appointments,
  | not only appointments with exactly the same startTime.
  |
  | Existing:
  | start -------- end
  |
  | New appointment conflicts when:
  | existing.start < new.end
  | AND
  | existing.end > new.start
  |
  */

  const existingAppointment =
    await prisma.appointment.findFirst({
      where: {
        branchId:
             patientPackage.branchId,
             
        therapistId:
          appointmentData.therapistId,
              
           
        date: {
          gte: new Date(
            appointmentData.date.getFullYear(),
            appointmentData.date.getMonth(),
            appointmentData.date.getDate(),
            0,
            0,
            0,
            0
          ),

          lte: new Date(
            appointmentData.date.getFullYear(),
            appointmentData.date.getMonth(),
            appointmentData.date.getDate(),
            23,
            59,
            59,
            999
          ),
        },

        status: {
          not:
            AppointmentStatus.CANCELLED_BY_MANAGER,
        },

        startTime: {
          lt: appointmentData.endTime,
        },

        endTime: {
          gt: appointmentData.startTime,
        },
      },
    });

  if (existingAppointment) {
    throw new Error(
      "This therapist already has an appointment during this time."
    );
  }

  /*
|--------------------------------------------------------------------------
| Active Bookings / Session Number
|--------------------------------------------------------------------------
|
| sessionNumber is a booking sequence number for the PatientPackage.
|
| CANCELLED_BY_MANAGER appointments remain in history, so their old
| sessionNumber is never reused.
|
| The booking limit is based on appointments that still reserve or
| consume a package session, not on the highest sessionNumber.
|
*/


/*
|--------------------------------------------------------------------------
| Available Booking Capacity
|--------------------------------------------------------------------------
|
| remainingSessions = sessions that have not yet been consumed.
|
| BOOKED appointments reserve future sessions, so we must make sure
| the patient cannot have more BOOKED appointments than the remaining
| package balance.
|
*/

const bookedAppointmentCount =
  await prisma.appointment.count({
    where: {
      patientPackageId:
        patientPackage.id,

      status:
        AppointmentStatus.BOOKED,
    },
  });

if (
  bookedAppointmentCount >=
  patientPackage.remainingSessions
) {
  throw new Error(
    "All remaining package sessions are already booked."
  );
}

/*
|--------------------------------------------------------------------------
| Session Number
|--------------------------------------------------------------------------
|
| Never reuse a previous sessionNumber, including cancelled
| appointments, because the database has:
|
| @@unique([patientPackageId, sessionNumber])
|
*/

const lastAppointment =
  await prisma.appointment.findFirst({
    where: {
      patientPackageId:
        patientPackage.id,
    },

    orderBy: {
      sessionNumber: "desc",
    },

    select: {
      sessionNumber: true,
    },
  });

const sessionNumber =
  (lastAppointment?.sessionNumber ?? 0) + 1;
  

  /*
  |--------------------------------------------------------------------------
  | Appointment Code
  |--------------------------------------------------------------------------
  */

  const code =
    await generateAppointmentCode();


  /*
  |--------------------------------------------------------------------------
  | Create Appointment
  |--------------------------------------------------------------------------
  */

  const appointment =
    await prisma.appointment.create({
      data: {
        code,

        patientPackageId:
          patientPackage.id,

        therapistId:
          appointmentData.therapistId,

        branchId:
          patientPackage.branchId,

        createdById: user.id,

        sessionNumber,

        date: appointmentData.date,

        startTime:
          appointmentData.startTime,

        endTime:
          appointmentData.endTime,

        duration: 40,

        status:
          AppointmentStatus.BOOKED,

        notes:
          appointmentData.notes?.trim() ||
          null,
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Refresh
  |--------------------------------------------------------------------------
  */

  revalidatePath("/schedule");

  revalidatePath(
    `/patients/${patientPackage.patientId}`
  );

  return {
    success: true,
    appointmentId: appointment.id,
    message:
      "Appointment created successfully.",
  };
}
/*
|--------------------------------------------------------------------------
| Time String To Minutes
|--------------------------------------------------------------------------
|
| Example:
|
| 15:00 -> 900
| 16:20 -> 980
| 23:00 -> 1380
|
*/

function timeStringToMinutes(
  time: string
) {
  const [hours, minutes] =
    time.split(":").map(Number);

  return hours * 60 + minutes;
}