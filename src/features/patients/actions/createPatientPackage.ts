"use server";

import {
  BranchStatus,
  DiscountType,
  PackageStatus,
  PatientPackageStatus,
  UserRole,
} from "@prisma/client";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import {
  generatePatientPackageCode,
} from "@/lib/utils/generatePatientPackageCode";

import {
  requirePermission,
} from "@/lib/auth/permissions";

import {
  requireBranchAccess,
} from "@/lib/auth/requireBranchAccess";

interface CreatePatientPackageData {
  patientId: number;
  packageId: number;
  branchId: number;

  discountType: DiscountType;
  discountValue: number;
}

export async function createPatientPackage(
  data: CreatePatientPackageData
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Permission
    |--------------------------------------------------------------------------
    */

    const user =
      await requirePermission(
        "packages:create"
      );

    const isSuperAdmin =
      user.role ===
      UserRole.SUPER_ADMIN;

    /*
    |--------------------------------------------------------------------------
    | Validate Basic Data
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isInteger(data.patientId) ||
      data.patientId <= 0
    ) {
      return {
        success: false,
        message: "Invalid patient.",
      };
    }

    if (
      !Number.isInteger(data.packageId) ||
      data.packageId <= 0
    ) {
      return {
        success: false,
        message: "Please select a package.",
      };
    }

    if (
      !Number.isInteger(data.branchId) ||
      data.branchId <= 0
    ) {
      return {
        success: false,
        message: "Please select a branch.",
      };
    }

    if (
      !Number.isFinite(data.discountValue) ||
      data.discountValue < 0
    ) {
      return {
        success: false,
        message: "Invalid discount value.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Branch Access
    |--------------------------------------------------------------------------
    |
    | SUPER_ADMIN can access any branch.
    | Other users can only use their assigned branch.
    |--------------------------------------------------------------------------
    */

    await requireBranchAccess(
      data.branchId
    );

    /*
    |--------------------------------------------------------------------------
    | Check Branch
    |--------------------------------------------------------------------------
    */

    const branch =
      await prisma.branch.findFirst({
        where: {
          id: data.branchId,
          status: BranchStatus.ACTIVE,
        },

        select: {
          id: true,
          name: true,
        },
      });

    if (!branch) {
      return {
        success: false,
        message:
          "Branch not found or inactive.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Check Patient + Branch Access
    |--------------------------------------------------------------------------
    |
    | SUPER_ADMIN:
    | Can renew a patient from any branch.
    |
    | Other users:
    | Patient must already belong to their branch.
    |--------------------------------------------------------------------------
    */

    const patient =
      await prisma.patient.findFirst({
        where: {
          id: data.patientId,

          ...(!isSuperAdmin
            ? {
                patientPackages: {
                  some: {
                    branchId:
                      user.branchId,
                  },
                },
              }
            : {}),
        },

        select: {
          id: true,
          name: true,
        },
      });

    if (!patient) {
      return {
        success: false,
        message: "Patient not found.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent Multiple Active Packages
    |--------------------------------------------------------------------------
    |
    | A patient can only have one ACTIVE package.
    |--------------------------------------------------------------------------
    */

    const activePackage =
      await prisma.patientPackage.findFirst({
        where: {
          patientId: patient.id,

          status:
            PatientPackageStatus.ACTIVE,
        },

        select: {
          id: true,
        },
      });

    if (activePackage) {
      return {
        success: false,

        message:
          "Patient already has an active package.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Get Active Package
    |--------------------------------------------------------------------------
    */

    const selectedPackage =
      await prisma.package.findFirst({
        where: {
          id: data.packageId,
          status: PackageStatus.ACTIVE,
        },

        select: {
          id: true,
          name: true,
          sessions: true,
          price: true,
          allowedExcuses: true,
        },
      });

    if (!selectedPackage) {
      return {
        success: false,
        message:
          "Package not found or inactive.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Discount Type
    |--------------------------------------------------------------------------
    */

    if (
      !Object.values(
        DiscountType
      ).includes(data.discountType)
    ) {
      return {
        success: false,
        message:
          "Invalid discount type.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate Final Price
    |--------------------------------------------------------------------------
    */

    const originalPrice =
      Number(selectedPackage.price);

    let finalPrice =
      originalPrice;

    if (
      data.discountType ===
      DiscountType.PERCENTAGE
    ) {
      if (
        data.discountValue > 100
      ) {
        return {
          success: false,

          message:
            "Percentage discount cannot exceed 100%.",
        };
      }

      finalPrice =
        originalPrice -
        originalPrice *
          (data.discountValue / 100);
    }

    if (
      data.discountType ===
      DiscountType.FIXED
    ) {
      if (
        data.discountValue >
        originalPrice
      ) {
        return {
          success: false,

          message:
            "Discount cannot exceed package price.",
        };
      }

      finalPrice =
        originalPrice -
        data.discountValue;
    }

    if (
      data.discountType ===
      DiscountType.NONE
    ) {
      finalPrice =
        originalPrice;
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Package Code
    |--------------------------------------------------------------------------
    */

    const packageCode =
      await generatePatientPackageCode();

    /*
    |--------------------------------------------------------------------------
    | Create Patient Package
    |--------------------------------------------------------------------------
    */

    const patientPackage =
      await prisma.patientPackage.create({
        data: {
          code:
            packageCode,

          patientId:
            patient.id,

          packageId:
            selectedPackage.id,

          branchId:
            branch.id,

          createdById:
            user.id,

          totalSessions:
            selectedPackage.sessions,

          remainingSessions:
            selectedPackage.sessions,

          allowedExcuses:
            selectedPackage.allowedExcuses,

          usedExcuses:
            0,

          originalPrice:
            selectedPackage.price,

          discountType:
            data.discountType,

          discountValue:
            data.discountType ===
            DiscountType.NONE
              ? 0
              : data.discountValue,

          finalPrice:
            finalPrice,

          status:
            PatientPackageStatus.ACTIVE,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | Revalidate
    |--------------------------------------------------------------------------
    */

    revalidatePath(
      "/patients"
    );

    revalidatePath(
      `/patients/${patient.id}`
    );

    revalidatePath(
      "/schedule"
    );

    return {
      success: true,

      message:
        "Package added successfully.",

      patientPackageId:
        patientPackage.id,
    };
  } catch (error) {
    console.error(
      "CREATE_PATIENT_PACKAGE_ERROR:",
      error
    );

    return {
      success: false,

      message:
        "Something went wrong while adding the package.",
    };
  }
}