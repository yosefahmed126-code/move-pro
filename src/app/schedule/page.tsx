import {
  BranchStatus,
  UserRole,
} from "@prisma/client";

import DashboardLayout from "@/components/layout/DashboardLayout";

import { prisma } from "@/lib/prisma";

import {
  requirePermission,
} from "@/lib/auth/permissions";

import { ScheduleHeader } from "@/features/schedule/components/ScheduleHeader";
import { ScheduleGrid } from "@/features/schedule/components/ScheduleGrid";
import { getSchedule } from "@/features/schedule/actions/getSchedule";

interface Props {
  searchParams: Promise<{
    date?: string;
    branch?: string;
    therapist?: string;
  }>;
}

export default async function SchedulePage({
  searchParams,
}: Props) {
  const params = await searchParams;

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
  | Date
  |--------------------------------------------------------------------------
  */

  const today =
    formatDateForUrl(
      new Date()
    );

  const selectedDate =
    isValidDateString(
      params.date
    )
      ? params.date!
      : today;

  /*
  |--------------------------------------------------------------------------
  | Branches Available To User
  |--------------------------------------------------------------------------
  */

  const branches =
    await prisma.branch.findMany({
      where: {
        status:
          BranchStatus.ACTIVE,

        ...(user.role !==
        UserRole.SUPER_ADMIN
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
  | No Available Branches
  |--------------------------------------------------------------------------
  */

  if (
    branches.length === 0
  ) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border bg-white p-6">
          <h1 className="text-xl font-bold">
            Schedule
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            No active branches
            are available.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Selected Branch
  |--------------------------------------------------------------------------
  */

  const requestedBranchId =
    Number(params.branch);

  const requestedBranchExists =
    Number.isInteger(
      requestedBranchId
    ) &&
    branches.some(
      (branch) =>
        branch.id ===
        requestedBranchId
    );

  const selectedBranchId =
    requestedBranchExists
      ? requestedBranchId
      : branches[0].id;

  /*
  |--------------------------------------------------------------------------
  | Schedule Data
  |--------------------------------------------------------------------------
  */

  const schedule =
    await getSchedule(
      selectedDate,
      selectedBranchId
    );

  /*
  |--------------------------------------------------------------------------
  | Therapists Available For Selected Day / Branch
  |--------------------------------------------------------------------------
  |
  | getSchedule already gives us the therapists
  | available for this branch/day.
  |
  */

  const therapists =
    schedule.therapists;

  /*
  |--------------------------------------------------------------------------
  | Selected Therapist
  |--------------------------------------------------------------------------
  */

  const requestedTherapistId =
    Number(params.therapist);

  const requestedTherapistExists =
    Number.isInteger(
      requestedTherapistId
    ) &&
    therapists.some(
      (therapist) =>
        therapist.id ===
        requestedTherapistId
    );

  /*
  |--------------------------------------------------------------------------
  | Default Therapist
  |--------------------------------------------------------------------------
  |
  | If there is no therapist in the URL,
  | select the first available therapist.
  |
  */

  const selectedTherapistId =
  requestedTherapistExists
    ? requestedTherapistId
    : 0;

  /*
  |--------------------------------------------------------------------------
  | Filter Schedule
  |--------------------------------------------------------------------------
  */

  const selectedTherapists =
  selectedTherapistId > 0
    ? therapists.filter(
        (therapist) =>
          therapist.id ===
          selectedTherapistId
      )
    : therapists;

const selectedAppointments =
  selectedTherapistId > 0
    ? schedule.appointments.filter(
        (appointment) =>
          appointment.therapistId ===
          selectedTherapistId
      )
    : schedule.appointments;

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ScheduleHeader
          selectedDate={
            selectedDate
          }
          selectedBranchId={
            selectedBranchId
          }
          selectedTherapistId={
            selectedTherapistId
          }
          branches={
            branches
          }
          therapists={
            therapists
          }
        />

        {therapists.length > 0 ? (
  <ScheduleGrid
    therapists={
      selectedTherapists
    }
    appointments={
      selectedAppointments
    }
    patients={
      schedule.patients
    }
    selectedDate={
      selectedDate
    }
  />
) : (
  <div className="rounded-xl border bg-white p-8 text-center">
    <p className="font-medium text-slate-700">
      No therapists available for this day.
    </p>

    <p className="mt-1 text-sm text-slate-500">
      Check the therapist working hours or select another date.
    </p>
  </div>
)}
        
      </div>
    </DashboardLayout>
  );
}

/*
|--------------------------------------------------------------------------
| Validate Date
|--------------------------------------------------------------------------
*/

function isValidDateString(
  value?: string
) {
  if (!value) {
    return false;
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return false;
  }

  const date = new Date(
    `${value}T12:00:00`
  );

  return !Number.isNaN(
    date.getTime()
  );
}

/*
|--------------------------------------------------------------------------
| Format Date For URL
|--------------------------------------------------------------------------
*/

function formatDateForUrl(
  date: Date
) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}