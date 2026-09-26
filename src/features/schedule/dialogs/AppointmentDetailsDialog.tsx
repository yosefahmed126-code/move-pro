"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  AppointmentStatus,
  UserRole,
} from "@prisma/client";

import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { updateAppointmentStatus } from "@/features/appointments/actions/updateAppointmentStatus";
import { undoAppointmentStatus } from "@/features/appointments/actions/undoAppointmentStatus";
import { rescheduleAppointment } from "@/features/appointments/actions/rescheduleAppointment";
import { getAvailableAppointmentSlots } from "@/features/appointments/actions/getAvailableAppointmentSlots";

import type { ScheduleAppointment } from "@/features/appointments/types";
import type { TherapistColumn } from "../types";

import { STATUS_COLORS } from "@/features/appointments/constants/statusColors";

interface Props {
  open: boolean;
  onClose: () => void;

  appointment: ScheduleAppointment;

  therapists: TherapistColumn[];
}

export function AppointmentDetailsDialog({
  open,
  onClose,
  appointment,
  therapists,
}: Props) {
  const router = useRouter();

  const { data: session } =
    useSession();

  const canCancelByManager =
    session?.user?.role ===
      UserRole.SUPER_ADMIN ||
    session?.user?.role ===
      UserRole.BRANCH_MANAGER;

  const [error, setError] =
    useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Reschedule State
  |--------------------------------------------------------------------------
  */

  const [
    showReschedule,
    setShowReschedule,
  ] = useState(false);

  const [
    newTherapistId,
    setNewTherapistId,
  ] = useState(
    String(appointment.therapistId)
  );

  const [
    newDate,
    setNewDate,
  ] = useState(
    formatDateInput(
      appointment.date
    )
  );

  const [
    newTime,
    setNewTime,
  ] = useState(
    formatTimeInput(
      appointment.startTime
    )
  );

  const [
    availableTimeSlots,
    setAvailableTimeSlots,
  ] = useState<string[]>([]);

  const [
    loadingTimeSlots,
    setLoadingTimeSlots,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load Available Reschedule Slots
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !showReschedule ||
      !newTherapistId ||
      !newDate
    ) {
      return;
    }

    let cancelled = false;

    async function loadSlots() {
      try {
        setLoadingTimeSlots(
          true
        );

        setError("");

        const result =
          await getAvailableAppointmentSlots(
            {
              therapistId:
                Number(
                  newTherapistId
                ),

              date: newDate,

              excludeAppointmentId:
                appointment.id,
            }
          );

        if (cancelled) {
          return;
        }

        setAvailableTimeSlots(
          result.slots
        );

        /*
         * Keep the currently selected
         * time only if it is still
         * available.
         */

        if (
          !result.slots.includes(
            newTime
          )
        ) {
          setNewTime("");
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Failed to load available times.";

        setAvailableTimeSlots(
          []
        );

        setNewTime("");

        setError(message);

        toast.error(message);
      } finally {
        if (!cancelled) {
          setLoadingTimeSlots(
            false
          );
        }
      }
    }

    loadSlots();

    return () => {
      cancelled = true;
    };
  }, [
    showReschedule,
    newTherapistId,
    newDate,
    appointment.id,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Appointment Status Action
  |--------------------------------------------------------------------------
  */

  const executeAction = async (
    status: AppointmentStatus
  ) => {
    try {
      setError("");

      setIsSubmitting(true);

      const result =
        await updateAppointmentStatus(
          {
            appointmentId:
              appointment.id,

            status,
          }
        );

      if (!result.success) {
        const message =
          result.message ??
          "Something went wrong.";

        setError(message);

        toast.error(message);

        return;
      }

      toast.success(
        result.message
      );

      onClose();

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      setError(message);

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Manager Undo / Restore
  |--------------------------------------------------------------------------
  */

  const handleUndo =
    async () => {
      try {
        setError("");

        setIsSubmitting(true);

        const result =
          await undoAppointmentStatus(
            {
              appointmentId:
                appointment.id,
            }
          );

        if (!result.success) {
          const message =
            result.message ??
            "Something went wrong.";

          setError(message);

          toast.error(message);

          return;
        }

        toast.success(
          result.message
        );

        onClose();

        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to restore appointment.";

        setError(message);

        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Reschedule
  |--------------------------------------------------------------------------
  */

  const handleReschedule =
    async () => {
      try {
        setError("");

        setIsSubmitting(true);

        if (!newTherapistId) {
          throw new Error(
            "Please select a therapist."
          );
        }

        if (!newDate) {
          throw new Error(
            "Please select a date."
          );
        }

        if (!newTime) {
          throw new Error(
            "Please select a time."
          );
        }

        const result =
          await rescheduleAppointment(
            {
              appointmentId:
                appointment.id,

              therapistId:
                Number(
                  newTherapistId
                ),

              date: newDate,

              startTime:
                newTime,
            }
          );

        toast.success(
          result.message
        );

        setShowReschedule(
          false
        );

        onClose();

        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to reschedule appointment.";

        setError(message);

        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Appointment State
  |--------------------------------------------------------------------------
  */

  const isBooked =
    appointment.status ===
    AppointmentStatus.BOOKED;

  const canUndo =
    canCancelByManager &&
    appointment.status !==
      AppointmentStatus.BOOKED;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (
          !value &&
          !isSubmitting
        ) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Appointment Details
          </DialogTitle>
        </DialogHeader>

        {/* Error */}

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Appointment */}

          <div className="grid grid-cols-2 gap-4">
            <Info
              label="Appointment Code"
              value={
                appointment.code
              }
            />

            <Info
              label="Session"
              value={`#${appointment.sessionNumber}`}
            />
          </div>

          {/* Patient */}

          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Patient
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {
                appointment.patient
                  .name
              }
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {
                appointment.patient
                  .code
              }
            </p>
          </div>

          {/* Package */}

          <div className="rounded-lg border p-4">
            <div className="mb-3">
              <p className="text-sm text-muted-foreground">
                Package
              </p>

              <p className="font-semibold">
                {
                  appointment
                    .patientPackage
                    .package.name
                }
              </p>

              <p className="text-xs text-slate-500">
                {
                  appointment
                    .patientPackage
                    .code
                }
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Info
                label="Remaining Sessions"
                value={`${appointment.patientPackage.remainingSessions} / ${appointment.patientPackage.totalSessions}`}
              />

              <Info
                label="Excuses"
                value={`${appointment.patientPackage.usedExcuses} / ${appointment.patientPackage.allowedExcuses}`}
              />
            </div>
          </div>

          {/* Appointment Details */}

          <div className="grid grid-cols-2 gap-4">
            <Info
              label="Therapist"
              value={
                appointment
                  .therapist.name
              }
            />

            <Info
              label="Branch"
              value={
                appointment.branch
                  .name
              }
            />

            <Info
              label="Date"
              value={formatDisplayDate(
                appointment.date
              )}
            />

            <Info
              label="Time"
              value={`${formatTime(
                appointment.startTime
              )} - ${formatTime(
                appointment.endTime
              )}`}
            />
          </div>

          {/* Status */}

          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              Status
            </p>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                STATUS_COLORS[
                  appointment.status
                ] ?? ""
              }`}
            >
              {appointment.status.replaceAll(
                "_",
                " "
              )}
            </span>
          </div>

          {/* Notes */}

          <div>
            <p className="text-sm text-muted-foreground">
              Notes
            </p>

            <p className="mt-1 whitespace-pre-wrap font-medium">
              {appointment.notes?.trim()
                ? appointment.notes
                : "No notes"}
            </p>
          </div>

          {/* Actions */}

          <div className="border-t pt-4">
            {isBooked ? (
              <div className="space-y-4">
                {/* Reschedule Button */}

                <button
                  type="button"
                  disabled={
                    isSubmitting
                  }
                  onClick={() => {
                    setError("");

                    setShowReschedule(
                      (current) =>
                        !current
                    );
                  }}
                  className="w-full rounded-md border border-blue-600 px-4 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showReschedule
                    ? "Close Reschedule"
                    : "Reschedule"}
                </button>

                {/* Reschedule Form */}

                {showReschedule && (
                  <div className="space-y-4 rounded-lg border bg-slate-50 p-4">
                    <div>
                      <p className="font-semibold text-slate-800">
                        Reschedule
                        Appointment
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Change the
                        therapist, date
                        or time without
                        changing the
                        session number.
                      </p>
                    </div>

                    {/* Therapist */}

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Therapist
                      </label>

                      <Select
                        value={
                          newTherapistId
                        }
                        onValueChange={(
                          value
                        ) => {
                          if (value) {
                            setNewTherapistId(
                              value
                            );
                          }
                        }}
                        disabled={
                          isSubmitting
                        }
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select Therapist" />
                        </SelectTrigger>

                        <SelectContent>
                          {therapists.map(
                            (
                              therapist
                            ) => (
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

                    {/* Date */}

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Date
                      </label>

                      <Input
                        type="date"
                        value={
                          newDate
                        }
                        disabled={
                          isSubmitting
                        }
                        onChange={(
                          event
                        ) =>
                          setNewDate(
                            event
                              .target
                              .value
                          )
                        }
                        className="bg-white"
                      />
                    </div>

                    {/* Time */}

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Time
                      </label>

                      <Select
                        value={
                          newTime
                        }
                        onValueChange={(
                          value
                        ) => {
                          if (value) {
                            setNewTime(
                              value
                            );
                          }
                        }}
                        disabled={
                          isSubmitting ||
                          loadingTimeSlots ||
                          !newTherapistId ||
                          !newDate ||
                          availableTimeSlots.length ===
                            0
                        }
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue
                            placeholder={
                              loadingTimeSlots
                                ? "Loading available times..."
                                : availableTimeSlots.length ===
                                    0
                                  ? "No available times"
                                  : "Select Time"
                            }
                          />
                        </SelectTrigger>

                        <SelectContent>
                          {availableTimeSlots.map(
                            (
                              time
                            ) => (
                              <SelectItem
                                key={
                                  time
                                }
                                value={
                                  time
                                }
                              >
                                {formatSlotLabel(
                                  time
                                )}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Save Reschedule */}

                    <button
                      type="button"
                      disabled={
                        isSubmitting ||
                        loadingTimeSlots ||
                        !newDate ||
                        !newTime ||
                        !newTherapistId
                      }
                      onClick={
                        handleReschedule
                      }
                      className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting
                        ? "Saving..."
                        : "Save New Appointment"}
                    </button>
                  </div>
                )}

                {/* Status Actions */}

                <div className="grid grid-cols-2 gap-3">
                  {/* Check In */}

                  <button
                    type="button"
                    disabled={
                      isSubmitting
                    }
                    onClick={() =>
                      executeAction(
                        AppointmentStatus.CHECKED_IN
                      )
                    }
                    className="rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Processing..."
                      : "Check In"}
                  </button>

                  {/* Excused */}

                  <button
                    type="button"
                    disabled={
                      isSubmitting
                    }
                    onClick={() =>
                      executeAction(
                        AppointmentStatus.EXCUSED
                      )
                    }
                    className="rounded-md bg-yellow-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Excused
                  </button>

                  {/* Missed */}

                  <button
                    type="button"
                    disabled={
                      isSubmitting
                    }
                    onClick={() =>
                      executeAction(
                        AppointmentStatus.MISSED
                      )
                    }
                    className="rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Missed
                  </button>

                  {/* Cancel By Manager */}

                  {canCancelByManager && (
                    <button
                      type="button"
                      disabled={
                        isSubmitting
                      }
                      onClick={() =>
                        executeAction(
                          AppointmentStatus.CANCELLED_BY_MANAGER
                        )
                      }
                      className="rounded-md bg-slate-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel by Manager
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-500">
                  This appointment
                  has already been
                  processed.
                </div>

                {canUndo && (
                  <button
                    type="button"
                    disabled={
                      isSubmitting
                    }
                    onClick={
                      handleUndo
                    }
                    className="w-full rounded-md bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Restoring..."
                      : appointment.status ===
                          AppointmentStatus.CANCELLED_BY_MANAGER
                        ? "Restore Appointment"
                        : "Undo Status / Restore to Booked"}
                  </button>
                )}

                {canUndo && (
                  <p className="text-center text-xs text-slate-500">
                    Manager
                    correction only.
                    Package balances
                    will be restored
                    automatically.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/*
|--------------------------------------------------------------------------
| Info Component
|--------------------------------------------------------------------------
*/

function Info({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-medium">
        {value}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Display Time
|--------------------------------------------------------------------------
*/

function formatTime(
  value: Date | string
) {
  return new Date(
    value
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/*
|--------------------------------------------------------------------------
| Display Date
|--------------------------------------------------------------------------
*/

function formatDisplayDate(
  value: Date | string
) {
  return new Date(
    value
  ).toLocaleDateString(
    "en-GB"
  );
}

/*
|--------------------------------------------------------------------------
| Date Input
|--------------------------------------------------------------------------
*/

function formatDateInput(
  value: Date | string
) {
  const date =
    new Date(value);

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

/*
|--------------------------------------------------------------------------
| Time Input
|--------------------------------------------------------------------------
*/

function formatTimeInput(
  value: Date | string
) {
  const date =
    new Date(value);

  const hours = String(
    date.getHours()
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0");

  return `${hours}:${minutes}`;
}

/*
|--------------------------------------------------------------------------
| Slot Display Label
|--------------------------------------------------------------------------
|
| Internal:
| 13:00
|
| Display:
| 1:00
|
*/

function formatSlotLabel(
  time: string
) {
  const [
    hourValue,
    minute,
  ] = time.split(":");

  const hour24 =
    Number(hourValue);

  const hour12 =
    hour24 % 12 || 12;

  return `${hour12}:${minute}`;
}