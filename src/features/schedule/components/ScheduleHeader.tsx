"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  UserRound,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BranchOption {
  id: number;
  name: string;
}

interface TherapistOption {
  id: number;
  name: string;
}

interface Props {
  selectedDate: string;
  selectedBranchId: number;
  selectedTherapistId: number;

  branches: BranchOption[];
  therapists: TherapistOption[];
}

export function ScheduleHeader({
  selectedDate,
  selectedBranchId,
  selectedTherapistId,
  branches,
  therapists,
}: Props) {
  const router = useRouter();

  /*
  |--------------------------------------------------------------------------
  | Navigate
  |--------------------------------------------------------------------------
  */

  const navigate = (
    date: string,
    branchId: number,
    therapistId: number
  ) => {
    const params =
      new URLSearchParams();

    params.set(
      "date",
      date
    );

    params.set(
      "branch",
      String(branchId)
    );

    if (therapistId > 0) {
      params.set(
        "therapist",
        String(therapistId)
      );
    }

    router.push(
      `/schedule?${params.toString()}`
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Change Date
  |--------------------------------------------------------------------------
  */

  const changeDate = (
    days: number
  ) => {
    const date = new Date(
      `${selectedDate}T12:00:00`
    );

    date.setDate(
      date.getDate() + days
    );

    navigate(
      formatDateForUrl(date),
      selectedBranchId,
      selectedTherapistId
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Today
  |--------------------------------------------------------------------------
  */

  const goToday = () => {
    navigate(
      formatDateForUrl(
        new Date()
      ),
      selectedBranchId,
      selectedTherapistId
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Date
  |--------------------------------------------------------------------------
  */

  const handleDateChange = (
    value: string
  ) => {
    if (!value) {
      return;
    }

    navigate(
      value,
      selectedBranchId,
      selectedTherapistId
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Branch
  |--------------------------------------------------------------------------
  |
  | When branch changes we reset therapist.
  |
  */

  const handleBranchChange = (
    value: string | null
  ) => {
    if (!value) {
      return;
    }

    const branchId =
      Number(value);

    if (
      !Number.isInteger(
        branchId
      ) ||
      branchId <= 0
    ) {
      return;
    }

    navigate(
      selectedDate,
      branchId,
      0
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Therapist
  |--------------------------------------------------------------------------
  */

  const handleTherapistChange = (
  value: string | null
) => {
  if (!value) {
    return;
  }

  /*
  |--------------------------------------------------------------------------
  | Show All Therapists
  |--------------------------------------------------------------------------
  */

  if (value === "all") {
    navigate(
      selectedDate,
      selectedBranchId,
      0
    );

    return;
  }

  /*
  |--------------------------------------------------------------------------
  | Selected Therapist
  |--------------------------------------------------------------------------
  */

  const therapistId =
    Number(value);

  if (
    !Number.isInteger(
      therapistId
    ) ||
    therapistId <= 0
  ) {
    return;
  }

  navigate(
    selectedDate,
    selectedBranchId,
    therapistId
  );
};

  /*
  |--------------------------------------------------------------------------
  | Display Date
  |--------------------------------------------------------------------------
  */

  const displayDate = new Date(
    `${selectedDate}T12:00:00`
  );

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* Title */}

        <div>
          <h1 className="text-2xl font-bold">
            Schedule
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage appointments and
            therapists schedule.
          </p>
        </div>

        {/* Controls */}

        <div className="flex flex-wrap items-center gap-2">
          {/* Branch */}

          <div className="flex items-center gap-2">
            <MapPin
              size={17}
              className="text-slate-400"
            />

            <Select
              value={String(
                selectedBranchId
              )}
              onValueChange={
                handleBranchChange
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>

              <SelectContent>
                {branches.map(
                  (branch) => (
                    <SelectItem
                      key={
                        branch.id
                      }
                      value={String(
                        branch.id
                      )}
                    >
                      {
                        branch.name
                      }
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Therapist */}

          <div className="flex items-center gap-2">
            <UserRound
              size={17}
              className="text-slate-400"
            />

            <Select
  value={
    selectedTherapistId > 0
      ? String(
          selectedTherapistId
        )
      : "all"
  }
  onValueChange={
    handleTherapistChange
  }
>
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="Select" />
  </SelectTrigger>

  <SelectContent>
    {/* All Therapists */}

    <SelectItem value="all">
      Select
    </SelectItem>

    {/* Individual Therapists */}

    {therapists.map(
      (therapist) => (
        <SelectItem
          key={
            therapist.id
          }
          value={String(
            therapist.id
          )}
        >
          {
            therapist.name
          }
        </SelectItem>
      )
    )}
  </SelectContent>
</Select>
          </div>

          {/* Previous */}

          <button
            type="button"
            onClick={() =>
              changeDate(-1)
            }
            className="rounded-lg border p-2.5 transition hover:bg-slate-50"
            title="Previous Day"
          >
            <ChevronLeft
              size={18}
            />
          </button>

          {/* Today */}

          <button
            type="button"
            onClick={goToday}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
          >
            Today
          </button>

          {/* Next */}

          <button
            type="button"
            onClick={() =>
              changeDate(1)
            }
            className="rounded-lg border p-2.5 transition hover:bg-slate-50"
            title="Next Day"
          >
            <ChevronRight
              size={18}
            />
          </button>

          {/* Date Picker */}

          <div className="relative">
            <CalendarDays
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="date"
              value={
                selectedDate
              }
              onChange={(
                event
              ) =>
                handleDateChange(
                  event.target
                    .value
                )
              }
              className="rounded-lg border py-2 pl-9 pr-3 text-sm outline-none transition focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Selected Date */}

      <div className="mt-4 border-t pt-4">
        <p className="font-semibold text-slate-700">
          {displayDate.toLocaleDateString(
            "en-US",
            {
              weekday:
                "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          )}
        </p>
      </div>
    </div>
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