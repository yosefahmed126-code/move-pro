"use client";

import {
  Controller,
  useForm,
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import type { PatientOption } from "@/features/schedule/types";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AppointmentFormValues = {
  patientId: string;
  notes: string;
};

interface Props {
  therapistName: string;
  slot: string;

  // YYYY-MM-DD
  date: string;

  patients: PatientOption[];

  onSubmit: (
    values: AppointmentFormValues
  ) => void | Promise<void>;
}

export function AppointmentForm({
  therapistName,
  slot,
  date,
  patients,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: {
      isSubmitting,
    },
  } = useForm<AppointmentFormValues>({
    defaultValues: {
      patientId: "",
      notes: "",
    },
  });

  const selectedPatientId =
    watch("patientId");

  const selectedPatient =
    patients.find(
      (patient) =>
        patient.id ===
        Number(selectedPatientId)
    );

  /*
  |--------------------------------------------------------------------------
  | Display Date
  |--------------------------------------------------------------------------
  */

  const displayDate = new Date(
    `${date}T12:00:00`
  );

  const formattedDate =
    Number.isNaN(displayDate.getTime())
      ? date
      : displayDate.toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* Therapist */}

      <div>
        <label className="mb-1 block text-sm font-medium">
          Therapist
        </label>

        <Input
          value={therapistName}
          disabled
        />
      </div>

      {/* Time */}

      <div>
        <label className="mb-1 block text-sm font-medium">
          Time
        </label>

        <Input
          value={slot}
          disabled
        />
      </div>

      {/* Date */}

      <div>
        <label className="mb-1 block text-sm font-medium">
          Date
        </label>

        <Input
          value={formattedDate}
          disabled
        />
      </div>

      {/* Patient */}

      <div>
        <label className="mb-1 block text-sm font-medium">
          Patient
        </label>

        <Controller
          control={control}
          name="patientId"
          rules={{
            required:
              "Please select a patient.",
          }}
          render={({ field }) => (
            <Select
              onValueChange={
                field.onChange
              }
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Patient" />
              </SelectTrigger>

              <SelectContent>
                {patients.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                    No patients with active
                    packages.
                  </div>
                ) : (
                  patients.map(
                    (patient) => (
                      <SelectItem
                        key={patient.id}
                        value={String(
                          patient.id
                        )}
                      >
                        <div className="flex flex-col py-1">
                          <span className="font-medium">
                            {patient.name}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            {
                              patient.packageName
                            }
                            {" • "}
                            Remaining:{" "}
                            {
                              patient.remainingSessions
                            }
                            {" • "}
                            {
                              patient.branchName
                            }
                          </span>
                        </div>
                      </SelectItem>
                    )
                  )
                )}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Selected Patient Package */}

      {selectedPatient && (
        <div className="rounded-lg border bg-slate-50 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Package Information
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">
                Package
              </p>

              <p className="font-medium">
                {
                  selectedPatient.packageName
                }
              </p>
            </div>

            <div>
              <p className="text-slate-500">
                Branch
              </p>

              <p className="font-medium">
                {
                  selectedPatient.branchName
                }
              </p>
            </div>

            <div>
              <p className="text-slate-500">
                Sessions
              </p>

              <p className="font-medium">
                {
                  selectedPatient.remainingSessions
                }
                {" / "}
                {
                  selectedPatient.totalSessions
                }{" "}
                Remaining
              </p>
            </div>

            <div>
              <p className="text-slate-500">
                Excuses
              </p>

              <p className="font-medium">
                {
                  selectedPatient.usedExcuses
                }
                {" / "}
                {
                  selectedPatient.allowedExcuses
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}

      <div>
        <label className="mb-1 block text-sm font-medium">
          Notes
        </label>

        <Textarea
          rows={4}
          placeholder="Optional appointment notes..."
          {...register("notes")}
        />
      </div>

      {/* Submit */}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            patients.length === 0
          }
        >
          {isSubmitting
            ? "Saving..."
            : "Save Appointment"}
        </Button>
      </div>
    </form>
  );
}