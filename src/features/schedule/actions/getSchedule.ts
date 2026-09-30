"use server";

import {
  AppointmentStatus,
  PatientPackageStatus,
  PatientStatus,
  TherapistStatus,
  UserRole,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
  requirePermission,
} from "@/lib/auth/permissions";

export async function getSchedule(
  date: string,
  branchId: number
) {
  /*
  |--------------------------------------------------------------------------
  | Authentication / Permission
  |--------------------------------------------------------------------------
  */

  const user =
    await requirePermission(
      "schedule:view"
    );

  /*
  |--------------------------------------------------------------------------
  | Branch Authorization
  |--------------------------------------------------------------------------
  |
  | SUPER_ADMIN can request any branch.
  |
  | Every other role is forced to use
  | the branch assigned to their account.
  |
  */

  const effectiveBranchId =
    user.role === UserRole.SUPER_ADMIN
      ? branchId
      : user.branchId;

  /*
  |--------------------------------------------------------------------------
  | Validate Date
  |--------------------------------------------------------------------------
  */

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(
      "Invalid schedule date."
    );
  }

  const selectedDate = new Date(
    `${date}T12:00:00`
  );

  if (
    Number.isNaN(
      selectedDate.getTime()
    )
  ) {
    throw new Error(
      "Invalid schedule date."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Validate Branch
  |--------------------------------------------------------------------------
  */

  if (
    !Number.isInteger(
      effectiveBranchId
    ) ||
    effectiveBranchId <= 0
  ) {
    throw new Error(
      "Invalid branch."
    );
  }

  const branch =
    await prisma.branch.findUnique({
      where: {
        id: effectiveBranchId,
      },

      select: {
        id: true,
        name: true,
        status: true,
      },
    });

  if (!branch) {
    throw new Error(
      "Branch not found."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Date Range
  |--------------------------------------------------------------------------
  */

  const start =
    new Date(selectedDate);

  start.setHours(
    0,
    0,
    0,
    0
  );

  const end =
    new Date(selectedDate);

  end.setHours(
    23,
    59,
    59,
    999
  );

  /*
  |--------------------------------------------------------------------------
  | Appointments
  |--------------------------------------------------------------------------
  */

  const appointments =
  await prisma.appointment.findMany({
    where: {
      branchId:
        effectiveBranchId,

      date: {
        gte: start,
        lte: end,
      },

      /*
      |--------------------------------------------------------------------------
      | Hide Cancelled Appointments From Schedule
      |--------------------------------------------------------------------------
      |
      | CANCELLED_BY_MANAGER appointments remain stored in the database
      | and patient history, but they no longer occupy a schedule slot.
      |
      */

      status: {
        not:
          AppointmentStatus.CANCELLED_BY_MANAGER,
      },
    },

      include: {
        patientPackage: {
          include: {
            patient: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },

            package: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        therapist: {
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

      orderBy: {
        startTime: "asc",
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Therapists
  |--------------------------------------------------------------------------
  */

  /*
|--------------------------------------------------------------------------
| Therapists Working On Selected Day
|--------------------------------------------------------------------------
|
| JavaScript getDay():
|
| Sunday    = 0
| Monday    = 1
| Tuesday   = 2
| Wednesday = 3
| Thursday  = 4
| Friday    = 5
| Saturday  = 6
|
*/

const selectedDayOfWeek =
  selectedDate.getDay();

const therapists =
  await prisma.therapist.findMany({
    where: {
      status:
        TherapistStatus.ACTIVE,

      branchId:
        effectiveBranchId,

      workingHours: {
        some: {
          dayOfWeek:
            selectedDayOfWeek,
        },
      },
    },

    orderBy: {
      name: "asc",
    },

    select: {
      id: true,
      name: true,

      workingHours: {
        where: {
          dayOfWeek:
            selectedDayOfWeek,
        },

        select: {
          id: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
        },
      },
    },
  });

  /*
  |--------------------------------------------------------------------------
  | Patients Available For Booking
  |--------------------------------------------------------------------------
  */

  const patients =
    await prisma.patient.findMany({
      where: {
        status:
          PatientStatus.ACTIVE,

        patientPackages: {
          some: {
            branchId:
              effectiveBranchId,

            status:
              PatientPackageStatus.ACTIVE,

            remainingSessions: {
              gt: 0,
            },
          },
        },
      },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        code: true,
        name: true,

        patientPackages: {
          where: {
            branchId:
              effectiveBranchId,

            status:
              PatientPackageStatus.ACTIVE,

            remainingSessions: {
              gt: 0,
            },
          },

          orderBy: {
            purchasedAt: "desc",
          },

          take: 1,

          select: {
            id: true,
            code: true,

            branchId: true,

            totalSessions: true,
            remainingSessions: true,

            allowedExcuses: true,
            usedExcuses: true,

            status: true,

            package: {
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
        },
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Format Appointments
  |--------------------------------------------------------------------------
  */

  const formattedAppointments =
    appointments.map(
      (appointment) => ({
        id:
          appointment.id,

        code:
          appointment.code,

        patientPackageId:
          appointment.patientPackageId,

        therapistId:
          appointment.therapistId,

        branchId:
          appointment.branchId,

        sessionNumber:
          appointment.sessionNumber,

        date:
          appointment.date,

        startTime:
          appointment.startTime,

        endTime:
          appointment.endTime,

        duration:
          appointment.duration,

        status:
          appointment.status,

        notes:
          appointment.notes,

        patient: {
          id:
            appointment
              .patientPackage
              .patient
              .id,

          code:
            appointment
              .patientPackage
              .patient
              .code,

          name:
            appointment
              .patientPackage
              .patient
              .name,
        },

        patientPackage: {
          id:
            appointment
              .patientPackage
              .id,

          code:
            appointment
              .patientPackage
              .code,

          totalSessions:
            appointment
              .patientPackage
              .totalSessions,

          remainingSessions:
            appointment
              .patientPackage
              .remainingSessions,

          allowedExcuses:
            appointment
              .patientPackage
              .allowedExcuses,

          usedExcuses:
            appointment
              .patientPackage
              .usedExcuses,

          status:
            appointment
              .patientPackage
              .status,

          package: {
            id:
              appointment
                .patientPackage
                .package
                .id,

            name:
              appointment
                .patientPackage
                .package
                .name,
          },
        },

        therapist:
          appointment.therapist,

        branch:
          appointment.branch,
      })
    );

  /*
  |--------------------------------------------------------------------------
  | Format Patients
  |--------------------------------------------------------------------------
  */

  const formattedPatients =
    patients.flatMap(
      (patient) => {
        const activePackage =
          patient.patientPackages[0];

        if (!activePackage) {
          return [];
        }

        return [
          {
            id:
              patient.id,

            code:
              patient.code,

            name:
              patient.name,

            patientPackageId:
              activePackage.id,

            patientPackageCode:
              activePackage.code,

            branchId:
              activePackage.branchId,

            branchName:
              activePackage
                .branch
                .name,

            packageId:
              activePackage
                .package
                .id,

            packageName:
              activePackage
                .package
                .name,

            totalSessions:
              activePackage
                .totalSessions,

            remainingSessions:
              activePackage
                .remainingSessions,

            allowedExcuses:
              activePackage
                .allowedExcuses,

            usedExcuses:
              activePackage
                .usedExcuses,
          },
        ];
      }
    );

  /*
  |--------------------------------------------------------------------------
  | Return
  |--------------------------------------------------------------------------
  */

  return {
    branch,

    therapists,

    appointments:
      formattedAppointments,

    patients:
      formattedPatients,
  };
}