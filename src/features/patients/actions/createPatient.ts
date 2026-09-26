"use server";

import { Gender } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { generatePatientPackageCode } from "@/lib/utils/generatePatientPackageCode";
import { prisma } from "@/lib/prisma";
import {
  CreatePatientSchema,
  CreatePatientFormData,
} from "@/lib/validators/patient";
import { generateCode } from "@/lib/utils/generateCode";
import {
  requirePermission,
} from "@/lib/auth/permissions";

import {
  requireBranchAccess,
} from "@/lib/auth/requireBranchAccess";

export async function createPatient(
  data: CreatePatientFormData
) {
  try {
    const user =
  await requirePermission(
    "patients:create"
  );
    const result = CreatePatientSchema.safeParse(data);

    if (!result.success) {
      return {
        success: false,
        message:
          "Please check the entered patient information.",
        errors: result.error.flatten(),
      };
    }

    const validatedData = result.data;
await requireBranchAccess(
  validatedData.branchId
);

    const existingPatient =
      await prisma.patient.findFirst({
        where: {
          mobile: validatedData.mobile,
        },
      });

    if (existingPatient) {
      return {
        success: false,
        message:
          "Patient with this mobile number already exists.",
      };
    }

    if (!validatedData.packageId) {
      return {
        success: false,
        message: "Please select a package.",
      };
    }

    const branch = await prisma.branch.findUnique({
      where: {
        id: validatedData.branchId,
      },
    });

    if (!branch) {
      return {
        success: false,
        message: "Branch not found.",
      };
    }

    const selectedPackage =
      await prisma.package.findUnique({
        where: {
          id: validatedData.packageId,
        },
      });

    if (!selectedPackage) {
      return {
        success: false,
        message: "Package not found.",
      };
    }

    const patientCode = await generateCode(
      "patient",
      "MP"
    );

    const patient = await prisma.$transaction(
      async (tx) => {
        const newPatient = await tx.patient.create({
          data: {
            code: patientCode,

            name: validatedData.name,

            gender:
              validatedData.gender === "Male"
                ? Gender.MALE
                : validatedData.gender === "Female"
                  ? Gender.FEMALE
                  : null,

            birthDate: validatedData.birthDate
              ? new Date(validatedData.birthDate)
              : null,

            mobile: validatedData.mobile,

            mobile2:
              validatedData.mobile2?.trim() ||
              null,

            email:
              validatedData.email?.trim() || null,

            nationalId:
              validatedData.nationalId?.trim() ||
              null,

            address:
              validatedData.address?.trim() ||
              null,
          },
        });

        /*
          Temporary package code generator.

          Later, when we build Package Management,
          this will be replaced with a generator that
          supports multiple packages per patient.
        */
        const packageCode =
          await generatePatientPackageCode();

        await tx.patientPackage.create({
          data: {
            code: packageCode,

            patientId: newPatient.id,

            packageId: selectedPackage.id,

            branchId: branch.id,

            createdById: user.id,

            totalSessions:
              selectedPackage.sessions,

            remainingSessions:
              selectedPackage.sessions,

            allowedExcuses:
              selectedPackage.allowedExcuses,

            usedExcuses: 0,

            originalPrice:
              selectedPackage.price,

            finalPrice:
              selectedPackage.price,
          },
        });

        return newPatient;
      }
    );

    revalidatePath("/patients");

    return {
      success: true,
      message: "Patient created successfully.",
      patientId: patient.id,
    };
  } catch (error) {
    console.error(
      "CREATE_PATIENT_ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong while creating the patient.",
    };
  }
}