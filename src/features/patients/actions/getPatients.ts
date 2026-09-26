"use server";

import {
  UserRole,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
  requirePermission,
} from "@/lib/auth/permissions";

export async function getPatients(
  search = "",
  page = 1,
  limit = 10
) {
  /*
  |--------------------------------------------------------------------------
  | Authentication + Permission
  |--------------------------------------------------------------------------
  */

  const user =
    await requirePermission(
      "patients:view"
    );

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const safePage =
    Number.isInteger(page) && page > 0
      ? page
      : 1;

  const safeLimit =
    Number.isInteger(limit) &&
    limit > 0
      ? limit
      : 10;

  const skip =
    (safePage - 1) * safeLimit;

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const normalizedSearch =
    search.trim();

  /*
  |--------------------------------------------------------------------------
  | Branch Isolation
  |--------------------------------------------------------------------------
  |
  | SUPER_ADMIN:
  | Can see patients from every branch.
  |
  | Other users:
  | Can only see patients that have a package
  | belonging to their own branch.
  |
  */

  const branchFilter =
    user.role === UserRole.SUPER_ADMIN
      ? {}
      : {
          patientPackages: {
            some: {
              branchId:
                user.branchId,
            },
          },
        };

  /*
  |--------------------------------------------------------------------------
  | Search Filter
  |--------------------------------------------------------------------------
  */

  const searchFilter =
    normalizedSearch
      ? {
          OR: [
            {
              name: {
                contains:
                  normalizedSearch,
              },
            },

            {
              mobile: {
                contains:
                  normalizedSearch,
              },
            },

            {
              code: {
                contains:
                  normalizedSearch,
              },
            },
          ],
        }
      : {};

  /*
  |--------------------------------------------------------------------------
  | Final WHERE
  |--------------------------------------------------------------------------
  */

  const where = {
    ...branchFilter,
    ...searchFilter,
  };

  /*
  |--------------------------------------------------------------------------
  | Patients + Count
  |--------------------------------------------------------------------------
  */

  const [patients, total] =
    await Promise.all([
      prisma.patient.findMany({
        where,

        include: {
          patientPackages: {
            /*
            |--------------------------------------------------------------------------
            | Package Branch Isolation
            |--------------------------------------------------------------------------
            |
            | SUPER_ADMIN:
            | Latest package from any branch.
            |
            | Other users:
            | Latest package from their own branch only.
            |
            */

            where:
              user.role ===
              UserRole.SUPER_ADMIN
                ? undefined
                : {
                    branchId:
                      user.branchId,
                  },

            include: {
              branch: {
                select: {
                  id: true,
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

            orderBy: {
              id: "desc",
            },

            take: 1,
          },
        },

        orderBy: {
          id: "desc",
        },

        skip,

        take: safeLimit,
      }),

      prisma.patient.count({
        where,
      }),
    ]);

  /*
  |--------------------------------------------------------------------------
  | Format Patients
  |--------------------------------------------------------------------------
  */

  const formattedPatients =
    patients.map((patient) => {
      const latestPackage =
        patient.patientPackages[0];

      return {
        id: patient.id,

        code: patient.code,

        name: patient.name,

        mobile: patient.mobile,

        status: patient.status,

        packageName:
          latestPackage?.package
            ?.name ?? "No Package",

        remainingSessions:
          latestPackage
            ?.remainingSessions ?? 0,

        totalSessions:
          latestPackage
            ?.totalSessions ?? 0,

        branchName:
          latestPackage?.branch
            ?.name ?? "No Branch",
      };
    });

  /*
  |--------------------------------------------------------------------------
  | Return
  |--------------------------------------------------------------------------
  */

  return {
    patients:
      formattedPatients,

    total,

    totalPages:
      Math.ceil(
        total / safeLimit
      ),

    currentPage:
      safePage,
  };
}