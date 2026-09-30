import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  PackagePlus,
} from "lucide-react";

import {
  BranchStatus,
  PackageStatus,
  PatientPackageStatus,
  UserRole,
} from "@prisma/client";

import DashboardLayout from "@/components/layout/DashboardLayout";

import RenewPackageForm from "@/features/patients/components/RenewPackageForm";

import { prisma } from "@/lib/prisma";

import {
  requirePermission,
} from "@/lib/auth/permissions";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewPatientPackagePage({
  params,
}: Props) {
  const { id } = await params;

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
  | Patient ID
  |--------------------------------------------------------------------------
  */

  const patientId =
    Number(id);

  if (
    !Number.isInteger(
      patientId
    ) ||
    patientId <= 0
  ) {
    notFound();
  }

  /*
  |--------------------------------------------------------------------------
  | Patient
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

      select: {
        id: true,
        code: true,
        name: true,

        patientPackages: {
          where: {
            status: {
              in: [
                PatientPackageStatus.ACTIVE,
                PatientPackageStatus.UPCOMING,
              ],
            },

            ...(!isSuperAdmin
              ? {
                  branchId:
                    user.branchId,
                }
              : {}),
          },

          orderBy: {
            purchasedAt: "desc",
          },

          select: {
            id: true,
            code: true,
            status: true,

            totalSessions: true,
            remainingSessions: true,

            package: {
              select: {
                name: true,
              },
            },

            branch: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

  if (!patient) {
    notFound();
  }

  /*
  |--------------------------------------------------------------------------
  | Active / Upcoming
  |--------------------------------------------------------------------------
  */

  const activePackage =
    patient.patientPackages.find(
      (item) =>
        item.status ===
        PatientPackageStatus.ACTIVE
    ) ?? null;

  const upcomingPackage =
    patient.patientPackages.find(
      (item) =>
        item.status ===
        PatientPackageStatus.UPCOMING
    ) ?? null;

  /*
  |--------------------------------------------------------------------------
  | Available Packages / Branches
  |--------------------------------------------------------------------------
  */

  const [
    packages,
    branches,
  ] = await Promise.all([
    prisma.package.findMany({
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
        price: true,
      },
    }),

    prisma.branch.findMany({
      where: {
        status:
          BranchStatus.ACTIVE,

        ...(!isSuperAdmin
          ? {
              id:
                user.branchId,
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
    }),
  ]);

  /*
  |--------------------------------------------------------------------------
  | Serialize Package Prices
  |--------------------------------------------------------------------------
  */

  const packageOptions =
    packages.map(
      (item) => ({
        id: item.id,
        name: item.name,
        sessions:
          item.sessions,
        price:
          Number(item.price),
      })
    );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back */}

        <Link
          href={`/patients/${patient.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-cyan-700"
        >
          <ArrowLeft size={17} />

          Back to Patient
        </Link>

        {/* Header */}

        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-50 p-3 text-cyan-700">
              <PackagePlus
                size={26}
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {activePackage
                  ? "Renew Package"
                  : "Add Package"}
              </h1>

              <p className="mt-1 text-slate-500">
                {patient.name} •{" "}
                {patient.code}
              </p>
            </div>
          </div>
        </div>

        {/* Current Package */}

        {activePackage && (
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Current Package
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500">
                  Package
                </p>

                <p className="mt-1 font-semibold">
                  {
                    activePackage
                      .package.name
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Code
                </p>

                <p className="mt-1 font-semibold">
                  {
                    activePackage.code
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Remaining
                </p>

                <p className="mt-1 font-semibold">
                  {
                    activePackage.remainingSessions
                  }{" "}
                  /{" "}
                  {
                    activePackage.totalSessions
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Branch
                </p>

                <p className="mt-1 font-semibold">
                  {
                    activePackage
                      .branch.name
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming */}

        {upcomingPackage && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="font-semibold text-blue-800">
              Upcoming Package
            </p>

            <p className="mt-1 text-sm text-blue-700">
              {
                upcomingPackage
                  .package.name
              }{" "}
              (
              {
                upcomingPackage.code
              }
              ) is already waiting
              to become active.
            </p>
          </div>
        )}

        {/* Form */}

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <RenewPackageForm
            patientId={
              patient.id
            }
            packages={
              packageOptions
            }
            branches={
              branches
            }
            hasActivePackage={
              Boolean(
                activePackage
              )
            }
            remainingSessions={
              activePackage
                ?.remainingSessions ??
              null
            }
            hasUpcomingPackage={
              Boolean(
                upcomingPackage
              )
            }
          />
        </div>
      </div>
    </DashboardLayout>
  );
}