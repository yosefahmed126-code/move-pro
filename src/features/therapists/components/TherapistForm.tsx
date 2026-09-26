"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createTherapist } from "../actions/createTherapist";
import { updateTherapist } from "../actions/updateTherapist";

interface WorkingHour {
  dayOfWeek: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface Props {
  mode: "create" | "edit";

  branches: {
    id: number;
    name: string;
  }[];

  therapist?: {
    id: number;
    name: string;
    mobile: string | null;
    email: string | null;
    specialty: string | null;
    notes: string | null;
    branchId: number;

    workingHours?: {
      id: number;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }[];
  };
}

/*
|--------------------------------------------------------------------------
| Days
|--------------------------------------------------------------------------
*/

const DAYS = [
  {
    value: 6,
    label: "Saturday",
  },
  {
    value: 0,
    label: "Sunday",
  },
  {
    value: 1,
    label: "Monday",
  },
  {
    value: 2,
    label: "Tuesday",
  },
  {
    value: 3,
    label: "Wednesday",
  },
  {
    value: 4,
    label: "Thursday",
  },
  {
    value: 5,
    label: "Friday",
  },
];

/*
|--------------------------------------------------------------------------
| Working Time Options
|--------------------------------------------------------------------------
|
| Values remain 24-hour format internally.
| Labels are displayed in 12-hour format.
|
*/

const TIME_OPTIONS =
  generateWorkingTimeOptions();

function generateWorkingTimeOptions() {
  const options: {
    value: string;
    label: string;
  }[] = [];

  for (
    let minutes = 0;
    minutes < 24 * 60;
    minutes += 20
  ) {
    const hours24 = Math.floor(
      minutes / 60
    );

    const mins = minutes % 60;

    const value = `${String(
      hours24
    ).padStart(2, "0")}:${String(
      mins
    ).padStart(2, "0")}`;

    options.push({
      value,
      label: formatTimeLabel(value),
    });
  }

  return options;
}

function formatTimeLabel(
  value: string
) {
  const [hourValue, minute] =
    value.split(":");

  const hour24 = Number(hourValue);

  const hour12 =
    hour24 % 12 || 12;

  const period =
    hour24 >= 12 ? "PM" : "AM";

  return `${hour12}:${minute} ${period}`;
}

/*
|--------------------------------------------------------------------------
| Default Working Hours
|--------------------------------------------------------------------------
*/

function buildWorkingHours(
  existing?: Props["therapist"]
) {
  return DAYS.map((day) => {
    const saved =
      existing?.workingHours?.find(
        (workingHour) =>
          workingHour.dayOfWeek ===
          day.value
      );

    return {
      dayOfWeek: day.value,

      enabled: Boolean(saved),

      startTime:
        saved?.startTime ??
        "09:00",

      endTime:
        saved?.endTime ??
        "21:00",
    };
  });
}

export default function TherapistForm({
  mode,
  therapist,
  branches,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] = useState({
    name: therapist?.name ?? "",
    mobile: therapist?.mobile ?? "",
    email: therapist?.email ?? "",
    specialty:
      therapist?.specialty ?? "",
    notes: therapist?.notes ?? "",
    branchId:
      therapist?.branchId ?? 0,

    workingHours:
      buildWorkingHours(therapist),
  });

  /*
  |--------------------------------------------------------------------------
  | Update Working Day
  |--------------------------------------------------------------------------
  */

  function updateWorkingHour(
    dayOfWeek: number,
    changes: Partial<WorkingHour>
  ) {
    setForm((current) => ({
      ...current,

      workingHours:
        current.workingHours.map(
          (workingHour) =>
            workingHour.dayOfWeek ===
            dayOfWeek
              ? {
                  ...workingHour,
                  ...changes,
                }
              : workingHour
        ),
    }));
  }

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      let result;

      if (mode === "create") {
        result =
          await createTherapist(
            form
          );
      } else {
        result =
          await updateTherapist({
            id: therapist!.id,
            ...form,
          });
      }

      if (result.success) {
        router.push(
          "/therapists"
        );

        router.refresh();

        return;
      }

      const message =
        "message" in result &&
        result.message
          ? result.message
          : "Please check the entered data.";

      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border bg-white p-8 shadow-sm">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        {/* Full Name */}

        <div>
          <label className="mb-2 block font-medium">
            Full Name
          </label>

          <input
            className="w-full rounded-lg border p-3"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />
        </div>

        {/* Mobile */}

        <div>
          <label className="mb-2 block font-medium">
            Mobile
          </label>

          <input
            className="w-full rounded-lg border p-3"
            value={form.mobile}
            onChange={(e) =>
              setForm({
                ...form,
                mobile:
                  e.target.value,
              })
            }
          />
        </div>

        {/* Email */}

        <div>
          <label className="mb-2 block font-medium">
            Email
          </label>

          <input
            type="email"
            className="w-full rounded-lg border p-3"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email:
                  e.target.value,
              })
            }
          />
        </div>

        {/* Specialty */}

        <div>
          <label className="mb-2 block font-medium">
            Specialty
          </label>

          <input
            className="w-full rounded-lg border p-3"
            value={
              form.specialty
            }
            onChange={(e) =>
              setForm({
                ...form,
                specialty:
                  e.target.value,
              })
            }
          />
        </div>

        {/* Branch */}

        <div>
          <label className="mb-2 block font-medium">
            Branch
          </label>

          <select
            className="w-full rounded-lg border p-3"
            value={form.branchId}
            onChange={(e) =>
              setForm({
                ...form,
                branchId:
                  Number(
                    e.target.value
                  ),
              })
            }
          >
            <option value={0}>
              Select Branch
            </option>

            {branches.map(
              (branch) => (
                <option
                  key={branch.id}
                  value={branch.id}
                >
                  {branch.name}
                </option>
              )
            )}
          </select>
        </div>

        {/* Notes */}

        <div className="md:col-span-2">
          <label className="mb-2 block font-medium">
            Notes
          </label>

          <textarea
            rows={4}
            className="w-full rounded-lg border p-3"
            value={form.notes}
            onChange={(e) =>
              setForm({
                ...form,
                notes:
                  e.target.value,
              })
            }
          />
        </div>

        {/* Working Schedule */}

        <div className="md:col-span-2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Working Schedule
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the therapist&apos;s
              working days and hours.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border">
            {DAYS.map((day) => {
              const workingHour =
                form.workingHours.find(
                  (item) =>
                    item.dayOfWeek ===
                    day.value
                )!;

              return (
                <div
                  key={day.value}
                  className="grid gap-4 border-b p-4 last:border-b-0 md:grid-cols-[180px_1fr_1fr]"
                >
                  {/* Day */}

                  <label className="flex items-center gap-3 font-medium">
                    <input
                      type="checkbox"
                      checked={
                        workingHour.enabled
                      }
                      onChange={(e) =>
                        updateWorkingHour(
                          day.value,
                          {
                            enabled:
                              e.target
                                .checked,
                          }
                        )
                      }
                      className="h-4 w-4"
                    />

                    {day.label}
                  </label>

                  {/* From */}

                  <div>
                    <label className="mb-1 block text-xs text-slate-500">
                      From
                    </label>

                    <select
                      disabled={
                        !workingHour.enabled
                      }
                      value={
                        workingHour.startTime
                      }
                      onChange={(e) =>
                        updateWorkingHour(
                          day.value,
                          {
                            startTime:
                              e.target
                                .value,
                          }
                        )
                      }
                      className="w-full rounded-lg border bg-white p-2.5 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {TIME_OPTIONS.map(
                        (time) => (
                          <option
                            key={
                              time.value
                            }
                            value={
                              time.value
                            }
                          >
                            {
                              time.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* To */}

                  <div>
                    <label className="mb-1 block text-xs text-slate-500">
                      To
                    </label>

                    <select
                      disabled={
                        !workingHour.enabled
                      }
                      value={
                        workingHour.endTime
                      }
                      onChange={(e) =>
                        updateWorkingHour(
                          day.value,
                          {
                            endTime:
                              e.target
                                .value,
                          }
                        )
                      }
                      className="w-full rounded-lg border bg-white p-2.5 disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {TIME_OPTIONS.map(
                        (time) => (
                          <option
                            key={
                              time.value
                            }
                            value={
                              time.value
                            }
                          >
                            {
                              time.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}

        <div className="flex justify-end gap-3 md:col-span-2">
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              router.push(
                "/therapists"
              )
            }
            className="rounded-lg border px-6 py-3 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-cyan-600 px-6 py-3 text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : "Save Therapist"}
          </button>
        </div>
      </form>
    </div>
  );
}