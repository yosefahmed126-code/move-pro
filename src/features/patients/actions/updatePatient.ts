"use server";

import {
  Gender,
  UserRole,
} from "@prisma/client";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import {
  requirePermission,
} from "@/lib/auth/permissions";

import {
  UpdatePatientSchema,
  UpdatePatientFormData,
} from "@/lib/validators/patient";

interface UpdatePatientData
  extends UpdatePatientFormData {
  id: number;
}

export async function updatePatient(
  data: UpdatePatientData
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Permission
    |--------------------------------------------------------------------------
    */

    const user =
      await requirePermission(
        "patients:update"
      );

    const isSuperAdmin =
      user.role ===
      UserRole.SUPER_ADMIN;

    /*
    |--------------------------------------------------------------------------
    | Validate ID
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isInteger(data.id) ||
      data.id <= 0
    ) {
      return {
        success: false,
        message: "Invalid patient.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Form
    |--------------------------------------------------------------------------
    */

    const result =
      UpdatePatientSchema.safeParse({
        name: data.name,
        gender: data.gender,
        birthDate: data.birthDate,
        mobile: data.mobile,
        mobile2: data.mobile2,
        email: data.email,
        nationalId: data.nationalId,
        address: data.address,
      });

    if (!result.success) {
      return {
        success: false,

        message:
          "Please check the entered patient information.",

        errors:
          result.error.flatten(),
      };
    }

    const validatedData =
      result.data;

    /*
    |--------------------------------------------------------------------------
    | Patient + Branch Access
    |--------------------------------------------------------------------------
    |
    | Do NOT trust the patient ID coming from the browser.
    |
    | Non-super-admin users must have access to at least
    | one package belonging to their own branch.
    |--------------------------------------------------------------------------
    */

    const patient =
      await prisma.patient.findFirst({
        where: {
          id: data.id,

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
    | Duplicate Mobile
    |--------------------------------------------------------------------------
    */

    const existingPatient =
      await prisma.patient.findFirst({
        where: {
          mobile:
            validatedData.mobile,

          NOT: {
            id: data.id,
          },
        },

        select: {
          id: true,
        },
      });

    if (existingPatient) {
      return {
        success: false,

        message:
          "Patient with this mobile number already exists.",
      };
    }

    /*
    |--------------------------------------------------------------------------
    | Update Patient
    |--------------------------------------------------------------------------
    |
    | Branch/package are intentionally NOT updated here.
    |--------------------------------------------------------------------------
    */

    await prisma.patient.update({
      where: {
        id: patient.id,
      },

      data: {
        name:
          validatedData.name,

        gender:
          validatedData.gender ===
          "Male"
            ? Gender.MALE
            : validatedData.gender ===
                "Female"
              ? Gender.FEMALE
              : null,

        birthDate:
          validatedData.birthDate
            ? new Date(
                validatedData.birthDate
              )
            : null,

        mobile:
          validatedData.mobile,

        mobile2:
          validatedData.mobile2?.trim() ||
          null,

        email:
          validatedData.email?.trim() ||
          null,

        nationalId:
          validatedData.nationalId?.trim() ||
          null,

        address:
          validatedData.address?.trim() ||
          null,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | Revalidate
    |--------------------------------------------------------------------------
    */

    revalidatePath("/patients");

    revalidatePath(
      `/patients/${patient.id}`
    );

    revalidatePath(
      `/patients/${patient.id}/edit`
    );

    return {
      success: true,
      message:
        "Patient updated successfully.",
    };
  } catch (error) {
    console.error(
      "UPDATE_PATIENT_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong while updating the patient.",
    };
  }
}