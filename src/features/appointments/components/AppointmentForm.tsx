"use client";

import { Controller, useForm } from "react-hook-form";

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
  date: Date;

  patients: PatientOption[];

  onSubmit: (values: AppointmentFormValues) => void;
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
  } = useForm<AppointmentFormValues>({
    defaultValues: {
      patientId: "",
      notes: "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div>
        <label className="text-sm font-medium">
          Therapist
        </label>

        <Input
          value={therapistName}
          disabled
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Time
        </label>

        <Input
          value={slot}
          disabled
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Date
        </label>

        <Input
          value={date.toDateString()}
          disabled
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Patient
        </label>

        <Controller
          control={control}
          name="patientId"
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Patient" />
              </SelectTrigger>

              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem
                    key={patient.id}
                    value={String(patient.id)}
                  >
                    <div className="flex flex-col">
                      <span>{patient.name}</span>

                      <span className="text-xs text-muted-foreground">
                        {patient.package?.name ?? "No Package"} • Remaining:{" "}
                        {patient.remaining}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Notes
        </label>

        <Textarea
          rows={4}
          {...register("notes")}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          Save Appointment
        </Button>
      </div>
    </form>
  );
}