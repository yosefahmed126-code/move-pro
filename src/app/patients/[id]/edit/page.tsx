import { notFound } from "next/navigation";

import {
  PatientPackageStatus,
  PackageStatus,
  BranchStatus,
  UserRole,
} from "@prisma/client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import PatientForm from "@/features/patients/components/PatientForm";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/permissions";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPatientPage({
  params,
}: Props) {
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
    user.role === UserRole.SUPER_ADMIN;

  /*
  |--------------------------------------------------------------------------
  | Patient ID
  |--------------------------------------------------------------------------
  */

  const { id } = await params;

  const patientId = Number(id);

  if (
    !Number.isInteger(patientId) ||
    patientId <= 0
  ) {
    notFound();
  }

  /*
  |--------------------------------------------------------------------------
  | Load Patient + Branch Isolation
  |--------------------------------------------------------------------------
  */

  const patient =
    await prisma.patient.findFirst({
      where: {
        id: patientId,

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

      include: {
        patientPackages: {
          where: !isSuperAdmin
            ? {
                branchId:
                  user.branchId,
              }
            : undefined,

          include: {
            branch: true,
            package: true,
          },

          orderBy: {
            purchasedAt: "desc",
          },
        },
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Not Found / No Access
  |--------------------------------------------------------------------------
  */

  if (!patient) {
    notFound();
  }

  /*
  |--------------------------------------------------------------------------
  | Current Package
  |--------------------------------------------------------------------------
  */

  const currentPackage =
    patient.patientPackages.find(
      (patientPackage) =>
        patientPackage.status ===
        PatientPackageStatus.ACTIVE
    ) ??
    patient.patientPackages[0];

  if (!currentPackage) {
    notFound();
  }

  /*
  |--------------------------------------------------------------------------
  | Branches
  |--------------------------------------------------------------------------
  |
  | SUPER_ADMIN:
  | All active branches.
  |
  | Other users:
  | Their branch only.
  |--------------------------------------------------------------------------
  */

  const branches =
    await prisma.branch.findMany({
      where: {
        status:
          BranchStatus.ACTIVE,

        ...(!isSuperAdmin
          ? {
              id: user.branchId,
            }
          : {}),
      },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Packages
  |--------------------------------------------------------------------------
  */

  const packages =
    await prisma.package.findMany({
      where: {
        status:
          PackageStatus.ACTIVE,
      },

      orderBy: {
        sessions: "asc",
      },

      select: {
        id: true,
        name: true,
        sessions: true,
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Edit Patient
          </h1>

          <p className="mt-2 text-slate-500">
            Update patient personal information.
          </p>
        </div>

        <PatientForm
          mode="edit"
          branches={branches}
          packages={packages}
          patient={{
            id: patient.id,

            name: patient.name,

            gender:
              patient.gender === "MALE"
                ? "Male"
                : patient.gender === "FEMALE"
                  ? "Female"
                  : "",

            birthDate:
              patient.birthDate
                ? patient.birthDate
                    .toISOString()
                    .split("T")[0]
                : "",

            mobile:
              patient.mobile,

            mobile2:
              patient.mobile2 ?? "",

            email:
              patient.email ?? "",

            nationalId:
              patient.nationalId ?? "",

            address:
              patient.address ?? "",

            branchId:
              currentPackage.branchId,

            packageId:
              currentPackage.packageId,
          }}
        />
      </div>
    </DashboardLayout>
  );
}