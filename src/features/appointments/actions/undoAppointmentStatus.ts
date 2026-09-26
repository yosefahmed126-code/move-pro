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

interface UndoAppointmentStatusData {
  appointmentId: number;
}

export async function undoAppointmentStatus(
  data: UndoAppointmentStatusData
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    const user =
      await requirePermission(
        "appointments:update"
      );

    /*
    |--------------------------------------------------------------------------
    | Manager Only
    |--------------------------------------------------------------------------
    */

    if (
      user.role !== UserRole.SUPER_ADMIN &&
      user.role !== UserRole.BRANCH_MANAGER
    ) {
      throw new Error(
        "UNDO_REQUIRES_MANAGER"
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate ID
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

          const patientPackage =
            appointment.patientPackage;

          /*
          |--------------------------------------------------------------------------
          | BOOKED
          |--------------------------------------------------------------------------
          |
          | There is nothing to undo.
          |
          */

          if (
            appointment.status ===
            AppointmentStatus.BOOKED
          ) {
            throw new Error(
              "NOTHING_TO_UNDO"
            );
          }

          /*
          |--------------------------------------------------------------------------
          | CHECKED IN / MISSED
          |--------------------------------------------------------------------------
          |
          | Both statuses consumed one session.
          | Restore that session.
          |
          */

          if (
            appointment.status ===
              AppointmentStatus.CHECKED_IN ||
            appointment.status ===
              AppointmentStatus.MISSED
          ) {
            if (
              patientPackage.remainingSessions >=
              patientPackage.totalSessions
            ) {
              throw new Error(
                "INVALID_PACKAGE_BALANCE"
              );
            }

            await tx.patientPackage.update({
              where: {
                id: patientPackage.id,
              },

              data: {
                remainingSessions: {
                  increment: 1,
                },

                /*
                | If the last session caused the
                | package to become COMPLETED,
                | reactivate it.
                */

                ...(patientPackage.status ===
                PatientPackageStatus.COMPLETED
                  ? {
                      status:
                        PatientPackageStatus.ACTIVE,

                      completedAt: null,
                    }
                  : {}),
              },
            });
          }

          /*
          |--------------------------------------------------------------------------
          | EXCUSED
          |--------------------------------------------------------------------------
          |
          | Restore the used excuse.
          |
          */

          if (
            appointment.status ===
            AppointmentStatus.EXCUSED
          ) {
            if (
              patientPackage.usedExcuses <= 0
            ) {
              throw new Error(
                "INVALID_EXCUSE_BALANCE"
              );
            }

            await tx.patientPackage.update({
              where: {
                id: patientPackage.id,
              },

              data: {
                usedExcuses: {
                  decrement: 1,
                },
              },
            });
          }

          /*
          |--------------------------------------------------------------------------
          | CANCELLED BY MANAGER
          |--------------------------------------------------------------------------
          |
          | No package balance was changed when
          | cancelled, so nothing needs restoring.
          |
          */

          if (
            appointment.status !==
              AppointmentStatus.CHECKED_IN &&
            appointment.status !==
              AppointmentStatus.MISSED &&
            appointment.status !==
              AppointmentStatus.EXCUSED &&
            appointment.status !==
              AppointmentStatus.CANCELLED_BY_MANAGER
          ) {
            throw new Error(
              "STATUS_CANNOT_BE_UNDONE"
            );
          }

          /*
          |--------------------------------------------------------------------------
          | Restore Appointment To BOOKED
          |--------------------------------------------------------------------------
          */

          const updatedAppointment =
            await tx.appointment.update({
              where: {
                id: appointment.id,
              },

              data: {
                status:
                  AppointmentStatus.BOOKED,

                checkedInAt: null,

                checkedInById: null,
              },
            });

          return {
  appointment: updatedAppointment,
  patientId: patientPackage.patientId,
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

    revalidatePath(
  `/patients/${result.patientId}`
);

    return {
      success: true,
      message:
        "Appointment restored to Booked successfully.",
    };
  } catch (error) {
    console.error(
      "UNDO_APPOINTMENT_STATUS_ERROR:",
      error
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "UNDO_REQUIRES_MANAGER"
      ) {
        return {
          success: false,
          message:
            "Only a manager can correct an appointment status.",
        };
      }

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
        "NOTHING_TO_UNDO"
      ) {
        return {
          success: false,
          message:
            "This appointment is already Booked.",
        };
      }

      if (
        error.message ===
        "INVALID_PACKAGE_BALANCE"
      ) {
        return {
          success: false,
          message:
            "The package session balance cannot be restored safely.",
        };
      }

      if (
        error.message ===
        "INVALID_EXCUSE_BALANCE"
      ) {
        return {
          success: false,
          message:
            "The package excuse balance cannot be restored safely.",
        };
      }

      if (
        error.message ===
        "STATUS_CANNOT_BE_UNDONE"
      ) {
        return {
          success: false,
          message:
            "This appointment status cannot be corrected.",
        };
      }
    }

    return {
      success: false,
      message:
        "Something went wrong while correcting the appointment.",
    };
  }
}