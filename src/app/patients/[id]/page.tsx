import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Edit,
  History,
  Package as PackageIcon,
  Plus,
  User,
} from "lucide-react";

import {
  BranchStatus,
  PackageStatus,
  PatientPackageStatus,
  UserRole,
} from "@prisma/client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/permissions";

interface Props {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    tab?: string;
  }>;
}

function Info({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-medium text-slate-800">
        {value ?? "-"}
      </p>
    </div>
  );
}

function formatDate(
  date: Date | null | undefined
) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatMoney(
  value: number | { toString(): string }
) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDiscount(
  type: string,
  value: number
) {
  if (type === "NONE") {
    return "No Discount";
  }

  if (type === "PERCENTAGE") {
    return `${value}%`;
  }

  if (type === "FIXED") {
    return `${formatMoney(value)} EGP`;
  }

  return "-";
}

function packageStatusClasses(
  status: string
) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700";

    case "COMPLETED":
      return "bg-blue-100 text-blue-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "EXPIRED":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default async function PatientDetailsPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { tab } = await searchParams;

  const allowedTabs = [
    "all",
    "package",
    "appointments",
    "history",
    "payments",
  ] as const;

  const activeTab =
    allowedTabs.includes(
      tab as (typeof allowedTabs)[number]
    )
      ? tab!
      : "all";

  /*
  |--------------------------------------------------------------------------
  | Authentication / Permission
  |--------------------------------------------------------------------------
  */

  const user =
    await requirePermission(
      "patients:view"
    );

  /*
  |--------------------------------------------------------------------------
  | Validate Patient ID
  |--------------------------------------------------------------------------
  */

  const patientId = Number(id);

  if (
    !Number.isInteger(patientId) ||
    patientId <= 0
  ) {
    notFound();
  }

  const isSuperAdmin =
    user.role === UserRole.SUPER_ADMIN;

  /*
  |--------------------------------------------------------------------------
  | Load Patient
  |--------------------------------------------------------------------------
  |
  | SUPER_ADMIN:
  | Can access patients from all branches.
  |
  | Other users:
  | Can only access a patient if that patient has
  | a package belonging to the user's branch.
  |
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
          /*
          |--------------------------------------------------------------------------
          | Package History Isolation
          |--------------------------------------------------------------------------
          */

          where: !isSuperAdmin
            ? {
                branchId:
                  user.branchId,
              }
            : undefined,

          include: {
            package: true,
            branch: true,

            appointments: {
              /*
              |--------------------------------------------------------------------------
              | Appointment Isolation
              |--------------------------------------------------------------------------
              */

              where: !isSuperAdmin
                ? {
                    branchId:
                      user.branchId,
                  }
                : undefined,

              include: {
                therapist: true,
                branch: true,
              },

              orderBy: {
                startTime: "desc",
              },
            },
          },

          orderBy: {
            purchasedAt: "desc",
          },
        },
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Not Found / No Branch Access
  |--------------------------------------------------------------------------
  */

  if (!patient) {
    notFound();
  }
  /*
|--------------------------------------------------------------------------
| Package Renewal State
|--------------------------------------------------------------------------
*/

const activePackage =
  patient.patientPackages.find(
    (patientPackage) =>
      patientPackage.status ===
      PatientPackageStatus.ACTIVE
  ) ?? null;

const upcomingPackage =
  patient.patientPackages.find(
    (patientPackage) =>
      patientPackage.status ===
      PatientPackageStatus.UPCOMING
  ) ?? null;

const canRenewPackage =
  activePackage !== null &&
  activePackage.remainingSessions <= 3 &&
  upcomingPackage === null;

const canAddPackage =
  activePackage === null &&
  upcomingPackage === null;
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
  ) ?? null;

/*
|--------------------------------------------------------------------------
| Current Package Appointments
|--------------------------------------------------------------------------
*/

const appointments =
  currentPackage?.appointments ?? [];

/*
|--------------------------------------------------------------------------
| Full Appointment History
|--------------------------------------------------------------------------
|
| Includes appointments from ALL packages:
| - Active
| - Completed
| - Cancelled
| - Expired
|
*/

const appointmentHistory =
  patient.patientPackages
    .flatMap((patientPackage) =>
      patientPackage.appointments.map(
        (appointment) => ({
          ...appointment,

          packageCode:
            patientPackage.code,

          packageName:
            patientPackage.package.name,

          packageStatus:
            patientPackage.status,
        })
      )
    )
    .sort(
      (a, b) =>
        b.date.getTime() -
        a.date.getTime()
    );
  /*
  |--------------------------------------------------------------------------
  | Packages / Branches Available For Renewal
  |--------------------------------------------------------------------------
  */

  const [
    availablePackages,
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
    }),
  ]);

  /*
  |--------------------------------------------------------------------------
  | Current Package
  |--------------------------------------------------------------------------
  */


  /*
  |--------------------------------------------------------------------------
  | Convert Prisma Decimal
  |--------------------------------------------------------------------------
  */

  const packageOptions =
    availablePackages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      sessions: pkg.sessions,
      price: Number(pkg.price),
    }));

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/patients"
              className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-cyan-600"
            >
              <ArrowLeft size={16} />
              Back to Patients
            </Link>

            <h1 className="text-3xl font-bold text-slate-800">
              {patient.name}
            </h1>

            <p className="mt-1 text-slate-500">
              Patient Code: {patient.code}
            </p>
          </div>

          <Link
            href={`/patients/${patient.id}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white transition hover:bg-cyan-700"
          >
            <Edit size={18} />
            Edit Patient
          </Link>
        </div>

        {/* Personal Information */}

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <User
              size={22}
              className="text-cyan-600"
            />

            <h2 className="text-xl font-semibold text-slate-800">
              Personal Information
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Info
              label="Patient Code"
              value={patient.code}
            />

            <Info
              label="Name"
              value={patient.name}
            />

            <Info
              label="Gender"
              value={
                patient.gender === "MALE"
                  ? "Male"
                  : patient.gender === "FEMALE"
                    ? "Female"
                    : "-"
              }
            />

            <Info
              label="Birth Date"
              value={formatDate(
                patient.birthDate
              )}
            />

            <Info
              label="Mobile"
              value={patient.mobile}
            />

            <Info
              label="Second Mobile"
              value={patient.mobile2 ?? "-"}
            />

            <Info
              label="Email"
              value={patient.email ?? "-"}
            />

            <Info
              label="National ID"
              value={
                patient.nationalId ?? "-"
              }
            />

            <Info
              label="Address"
              value={patient.address ?? "-"}
            />

            <Info
              label="Status"
              value={patient.status}
            />

            <Info
              label="Created At"
              value={formatDate(
                patient.createdAt
              )}
            />
          </div>
          
          <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
  {canAddPackage && (
    <Link
      href={`/patients/${patient.id}/packages/new`}
      className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
    >
      <Plus size={17} />

      Add Package
    </Link>
  )}

  {canRenewPackage && (
    <Link
      href={`/patients/${patient.id}/packages/new`}
      className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
    >
      <PackageIcon size={17} />

      Renew Package
    </Link>
  )}

  {activePackage &&
    activePackage.remainingSessions > 3 &&
    !upcomingPackage && (
      <button
        type="button"
        disabled
        title="Renewal becomes available when 3 sessions or fewer remain."
        className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"
      >
        <PackageIcon size={17} />

        Renew Package
      </button>
    )}

  {upcomingPackage && (
    <div className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700">
      <PackageIcon size={17} />

      Upcoming Package
    </div>
  )}
</div>
        </section>

        {/* Patient Navigation */}

<div className="overflow-x-auto rounded-xl border bg-white p-2 shadow-sm">
  <div className="flex min-w-max items-center gap-1">
    {[
      {
        value: "all",
        label: "All",
      },
      {
        value: "package",
        label: "Package",
      },
      {
        value: "appointments",
        label: "Appointments",
      },
      {
        value: "history",
        label: "History",
      },
      {
        value: "payments",
        label: "Payments",
      },
    ].map((item) => {
      const active =
        activeTab === item.value;

      return (
        <Link
          key={item.value}
          href={`/patients/${patient.id}?tab=${item.value}`}
          className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
            active
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {item.label}
        </Link>
      );
    })}
  </div>
</div>

        {/* Current Package */}

{(activeTab === "all" ||
  activeTab === "package") && (
  <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <PackageIcon
              size={22}
              className="text-cyan-600"
            />

            <h2 className="text-xl font-semibold text-slate-800">
              Current Package
            </h2>
          </div>

          {currentPackage ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Info
                label="Package Code"
                value={currentPackage.code}
              />

              <Info
                label="Package"
                value={
                  currentPackage.package.name
                }
              />

              <Info
                label="Branch"
                value={
                  currentPackage.branch.name
                }
              />

              <Info
                label="Sessions"
                value={`${currentPackage.remainingSessions} / ${currentPackage.totalSessions}`}
              />

              <Info
                label="Excuses"
                value={`${currentPackage.usedExcuses} / ${currentPackage.allowedExcuses}`}
              />

              <Info
                label="Original Price"
                value={`${formatMoney(
                  currentPackage.originalPrice
                )} EGP`}
              />

              <Info
                label="Discount"
                value={formatDiscount(
                  currentPackage.discountType,
                  currentPackage.discountValue
                )}
              />

              <Info
                label="Final Price"
                value={`${formatMoney(
                  currentPackage.finalPrice
                )} EGP`}
              />

              <Info
                label="Purchased At"
                value={formatDate(
                  currentPackage.purchasedAt
                )}
              />

              <Info
                label="Status"
                value={
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${packageStatusClasses(
                      currentPackage.status
                    )}`}
                  >
                    {currentPackage.status}
                  </span>
                }
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium text-slate-700">
                No active package
              </p>

              <p className="mt-1 text-sm text-slate-500">
                You can add a new package below.
              </p>
            </div>
          )}
         </section>
        )}

       {/* Session History */}

{(activeTab === "all" ||
  activeTab === "history") && (
  <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
    <div className="flex items-center gap-2 border-b p-6">
      <History
        size={22}
        className="text-cyan-600"
      />

      <div>
        <h2 className="text-xl font-semibold text-slate-800">
          Session History
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          All patient sessions across all packages.
        </p>
      </div>
    </div>

    {appointmentHistory.length === 0 ? (
      <div className="p-10 text-center">
        <History
          size={36}
          className="mx-auto mb-3 text-slate-300"
        />

        <p className="font-medium text-slate-600">
          No session history found.
        </p>

        <p className="mt-1 text-sm text-slate-400">
          Patient sessions will appear here.
        </p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="text-left text-sm font-semibold text-slate-600">
              <th className="px-5 py-3">
                Session
              </th>

              <th className="px-5 py-3">
                Date
              </th>

              <th className="px-5 py-3">
                Time
              </th>

              <th className="px-5 py-3">
                Therapist
              </th>

              <th className="px-5 py-3">
                Branch
              </th>

              <th className="px-5 py-3">
                Package
              </th>

              <th className="px-5 py-3">
                Package Code
              </th>

              <th className="px-5 py-3">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {appointmentHistory.map(
              (appointment) => (
                <tr
                  key={appointment.id}
                  className="border-t transition hover:bg-slate-50"
                >
                  {/* Session */}

                  <td className="px-5 py-4 font-semibold text-slate-800">
                    #
                    {
                      appointment.sessionNumber
                    }
                  </td>

                  {/* Date */}

                  <td className="whitespace-nowrap px-5 py-4">
                    {formatDate(
                      appointment.date
                    )}
                  </td>

                  {/* Time */}

                  <td className="whitespace-nowrap px-5 py-4">
                    {formatTime(
                      appointment.startTime
                    )}
                  </td>

                  {/* Therapist */}

                  <td className="px-5 py-4">
                    {
                      appointment
                        .therapist.name
                    }
                  </td>

                  {/* Branch */}

                  <td className="px-5 py-4">
                    {
                      appointment
                        .branch.name
                    }
                  </td>

                  {/* Package */}

                  <td className="px-5 py-4">
                    {
                      appointment.packageName
                    }
                  </td>

                  {/* Package Code */}

                  <td className="px-5 py-4 font-medium text-slate-600">
                    {
                      appointment.packageCode
                    }
                  </td>

                  {/* Status */}

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                        appointment.status ===
                        "CHECKED_IN"
                          ? "bg-emerald-100 text-emerald-700"
                          : appointment.status ===
                              "BOOKED"
                            ? "bg-amber-100 text-amber-700"
                            : appointment.status ===
                                "EXCUSED"
                              ? "bg-blue-100 text-blue-700"
                              : appointment.status ===
                                  "MISSED"
                                ? "bg-red-100 text-red-700"
                                : appointment.status ===
                                    "CANCELLED_BY_MANAGER"
                                  ? "bg-slate-200 text-slate-700"
                                  : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {appointment.status ===
                      "CHECKED_IN"
                        ? "Checked In"
                        : appointment.status ===
                            "BOOKED"
                          ? "Booked"
                          : appointment.status ===
                              "EXCUSED"
                            ? "Excused"
                            : appointment.status ===
                                "MISSED"
                              ? "Missed"
                              : appointment.status ===
                                  "CANCELLED_BY_MANAGER"
                                ? "Cancel By Manager"
                                : appointment.status}
                    </span>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    )}
  </section>
)}
    
        {/* Current Package Appointments */}

{(activeTab === "all" ||
  activeTab === "appointments") && (
  <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {/* Appointments */}

        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b p-6">
            <CalendarDays
              size={22}
              className="text-cyan-600"
            />

            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                Current Package Appointments
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Appointments linked to the
                patient's active package.
              </p>
            </div>
          </div>

          {appointments.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No appointments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-sm font-semibold text-slate-600">
                    <th className="px-5 py-3">
                      Session
                    </th>

                    <th className="px-5 py-3">
                      Date
                    </th>

                    <th className="px-5 py-3">
                      Time
                    </th>

                    <th className="px-5 py-3">
                      Therapist
                    </th>

                    <th className="px-5 py-3">
                      Branch
                    </th>

                    <th className="px-5 py-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.map(
                    (appointment) => (
                      <tr
                        key={appointment.id}
                        className="border-t transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          #
                          {
                            appointment.sessionNumber
                          }
                        </td>

                        <td className="px-5 py-4">
                          {formatDate(
                            appointment.date
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {formatTime(
                            appointment.startTime
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {
                            appointment
                              .therapist.name
                          }
                        </td>

                        <td className="px-5 py-4">
                          {
                            appointment
                              .branch.name
                          }
                        </td>

                        <td className="px-5 py-4">
                          {appointment.status}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
          </section>
)}
      </div>
    </DashboardLayout>
  );
}