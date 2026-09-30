"use server";

import {
  AppointmentStatus,
  PatientPackageStatus,
  UserRole,
} from "@prisma/client";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

import {
  requirePermission,
} from "@/lib/auth/permissions";

import {
  requireBranchAccess,
} from "@/lib/auth/requireBranchAccess";

interface UpdateAppointmentStatusData {
  appointmentId: number;
  status: AppointmentStatus;
}

export async function updateAppointmentStatus(
  data: UpdateAppointmentStatusData
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Authentication / Permission
    |--------------------------------------------------------------------------
    */

    const user =
      await requirePermission(
        "appointments:update"
      );

    /*
    |--------------------------------------------------------------------------
    | Validate Appointment ID
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isInteger(data.appointmentId) ||
      data.appointmentId <= 0
    ) {
      return {
        success: false,
        message: "Invalid appointment.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Transaction
    |--------------------------------------------------------------------------
    */

    const result =
      await prisma.$transaction(
        async (tx) => {
          /*
          |--------------------------------------------------------------------------
          | Load Appointment
          |--------------------------------------------------------------------------
          */

          const appointment =
            await tx.appointment.findUnique({
              where: {
                id: data.appointmentId,
              },

              include: {
                patientPackage: true,
              },
            });

          if (!appointment) {
            throw new Error(
              "APPOINTMENT_NOT_FOUND"
            );
          }

          /*
          |--------------------------------------------------------------------------
          | Branch Access
          |--------------------------------------------------------------------------
          */

          await requireBranchAccess(
            appointment.branchId
          );

          /*
          |--------------------------------------------------------------------------
          | Cancel By Manager Permission
          |--------------------------------------------------------------------------
          |
          | Only SUPER_ADMIN and BRANCH_MANAGER
          | can cancel appointments.
          |
          */

          if (
            data.status ===
              AppointmentStatus.CANCELLED_BY_MANAGER &&
            user.role !==
              UserRole.SUPER_ADMIN &&
            user.role !==
              UserRole.BRANCH_MANAGER
          ) {
            throw new Error(
              "CANCEL_REQUIRES_MANAGER"
            );
          }

          /*
          |--------------------------------------------------------------------------
          | Allowed Statuses
          |--------------------------------------------------------------------------
          */

          const allowedStatuses:
            AppointmentStatus[] = [
            AppointmentStatus.CHECKED_IN,
            AppointmentStatus.EXCUSED,
            AppointmentStatus.MISSED,
            AppointmentStatus.CANCELLED_BY_MANAGER,
          ];

          if (
            !allowedStatuses.includes(
              data.status
            )
          ) {
            throw new Error(
              "INVALID_STATUS_TRANSITION"
            );
          }

          /*
          |--------------------------------------------------------------------------
          | Same Status
          |--------------------------------------------------------------------------
          */

          if (
            appointment.status ===
            data.status
          ) {
            return {
              appointment,
              changed: false,
            };
          }

          /*
          |--------------------------------------------------------------------------
          | Final Status Protection
          |--------------------------------------------------------------------------
          |
          | Once CHECKED_IN, MISSED or EXCUSED,
          | the appointment cannot be changed
          | using this normal status action.
          |
          | Later we will create a separate
          | manager correction / undo system.
          |
          */

          if (
            appointment.status ===
              AppointmentStatus.CHECKED_IN ||
            appointment.status ===
              AppointmentStatus.MISSED ||
            appointment.status ===
              AppointmentStatus.EXCUSED
          ) {
            throw new Error(
              "FINAL_STATUS_CANNOT_BE_CHANGED"
            );
          }

          const patientPackage =
            appointment.patientPackage;

          /*
          |--------------------------------------------------------------------------
          | CHECKED IN
          |--------------------------------------------------------------------------
          */

          if (
            data.status ===
            AppointmentStatus.CHECKED_IN
          ) {
            if (
              patientPackage.status !==
              PatientPackageStatus.ACTIVE
            ) {
              throw new Error(
                "PACKAGE_NOT_ACTIVE"
              );
            }

            if (
              patientPackage.remainingSessions <=
              0
            ) {
              throw new Error(
                "NO_REMAINING_SESSIONS"
              );
            }

            const remainingSessions =
              patientPackage.remainingSessions -
              1;

            await tx.patientPackage.update({
              where: {
                id: patientPackage.id,
              },

              data: {
                remainingSessions,

                ...(remainingSessions === 0
                  ? {
                      status:
                        PatientPackageStatus.COMPLETED,

                      completedAt:
                        new Date(),
                    }
                  : {}),
              },
            });
            /*
|--------------------------------------------------------------------------
| Activate Upcoming Package
|--------------------------------------------------------------------------
|
| When the current package reaches zero sessions,
| activate the patient's UPCOMING package automatically.
|
*/

if (remainingSessions === 0) {
  const upcomingPackage =
    await tx.patientPackage.findFirst({
      where: {
        patientId:
          patientPackage.patientId,

        status:
          PatientPackageStatus.UPCOMING,
      },

      orderBy: {
        purchasedAt: "asc",
      },

      select: {
        id: true,
      },
    });

  if (upcomingPackage) {
    await tx.patientPackage.update({
      where: {
        id: upcomingPackage.id,
      },

      data: {
        status:
          PatientPackageStatus.ACTIVE,

        completedAt: null,
      },
    });
  }
}
          }

          /*
          |--------------------------------------------------------------------------
          | MISSED
          |--------------------------------------------------------------------------
          */

          if (
            data.status ===
            AppointmentStatus.MISSED
          ) {
            if (
              patientPackage.status !==
              PatientPackageStatus.ACTIVE
            ) {
              throw new Error(
                "PACKAGE_NOT_ACTIVE"
              );
            }

            if (
              patientPackage.remainingSessions <=
              0
            ) {
              throw new Error(
                "NO_REMAINING_SESSIONS"
              );
            }

            const remainingSessions =
              patientPackage.remainingSessions -
              1;

            await tx.patientPackage.update({
              where: {
                id: patientPackage.id,
              },

              data: {
                remainingSessions,

                ...(remainingSessions === 0
                  ? {
                      status:
                        PatientPackageStatus.COMPLETED,

                      completedAt:
                        new Date(),
                    }
                  : {}),
              },
            });
            if (remainingSessions === 0) {
  const upcomingPackage =
    await tx.patientPackage.findFirst({
      where: {
        patientId:
          patientPackage.patientId,

        status:
          PatientPackageStatus.UPCOMING,
      },

      orderBy: {
        purchasedAt: "asc",
      },

      select: {
        id: true,
      },
    });

  if (upcomingPackage) {
    await tx.patientPackage.update({
      where: {
        id: upcomingPackage.id,
      },

      data: {
        status:
          PatientPackageStatus.ACTIVE,

        completedAt: null,
      },
    });
  }
}
          }

          /*
          |--------------------------------------------------------------------------
          | EXCUSED
          |--------------------------------------------------------------------------
          */

          if (
            data.status ===
            AppointmentStatus.EXCUSED
          ) {
            if (
              patientPackage.status !==
              PatientPackageStatus.ACTIVE
            ) {
              throw new Error(
                "PACKAGE_NOT_ACTIVE"
              );
            }

            if (
              patientPackage.usedExcuses >=
              patientPackage.allowedExcuses
            ) {
              throw new Error(
                "NO_EXCUSES_REMAINING"
              );
            }

            await tx.patientPackage.update({
              where: {
                id: patientPackage.id,
              },

              data: {
                usedExcuses: {
                  increment: 1,
                },
              },
            });
          }
          

          /*
          |--------------------------------------------------------------------------
          | Update Appointment
          |--------------------------------------------------------------------------
          */

          const updatedAppointment =
            await tx.appointment.update({
              where: {
                id: appointment.id,
              },

              data: {
                status: data.status,

                ...(data.status ===
                AppointmentStatus.CHECKED_IN
                  ? {
                      checkedInAt:
                        new Date(),

                      checkedInById:
                        user.id,
                    }
                  : {}),
              },
            });

          return {
            appointment:
              updatedAppointment,

            changed: true,
          };
        }
      );

    /*
    |--------------------------------------------------------------------------
    | Revalidate
    |--------------------------------------------------------------------------
    */

    revalidatePath("/schedule");
    revalidatePath("/patients");

    return {
      success: true,

      message: result.changed
        ? "Appointment status updated successfully."
        : "Appointment already has this status.",
    };
  } catch (error) {
    console.error(
      "UPDATE_APPOINTMENT_STATUS_ERROR:",
      error
    );

    /*
    |--------------------------------------------------------------------------
    | Known Errors
    |--------------------------------------------------------------------------
    */

    if (error instanceof Error) {
      if (
        error.message ===
        "APPOINTMENT_NOT_FOUND"
      ) {
        return {
          success: false,
          message:
            "Appointment not found.",
        };
      }

      if (
        error.message ===
        "CANCEL_REQUIRES_MANAGER"
      ) {
        return {
          success: false,
          message:
            "Only a manager can cancel an appointment.",
        };
      }

      if (
        error.message ===
        "INVALID_STATUS_TRANSITION"
      ) {
        return {
          success: false,
          message:
            "This appointment status change is not allowed.",
        };
      }

      if (
        error.message ===
        "FINAL_STATUS_CANNOT_BE_CHANGED"
      ) {
        return {
          success: false,
          message:
            "This session has already been processed and cannot be changed.",
        };
      }

      if (
        error.message ===
        "PACKAGE_NOT_ACTIVE"
      ) {
        return {
          success: false,
          message:
            "Patient package is not active.",
        };
      }

      if (
        error.message ===
        "NO_REMAINING_SESSIONS"
      ) {
        return {
          success: false,
          message:
            "Patient has no remaining sessions.",
        };
      }

      if (
        error.message ===
        "NO_EXCUSES_REMAINING"
      ) {
        return {
          success: false,
          message:
            "Patient has no remaining excuses.",
        };
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Unknown Error
    |--------------------------------------------------------------------------
    */

    return {
      success: false,
      message:
        "Something went wrong while updating the appointment.",
    };
  }
}