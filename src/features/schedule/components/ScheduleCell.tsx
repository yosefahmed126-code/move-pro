"use client";

import { useState } from "react";

import { AppointmentCard } from "./AppointmentCard";

import { CreateAppointmentDialog } from "../dialogs/CreateAppointmentDialog";

import type { ScheduleAppointment } from "@/features/appointments/types";

import type {
  PatientOption,
  TherapistColumn,
} from "../types";

interface Props {
  appointment?: ScheduleAppointment;

  therapist: TherapistColumn;

  slot: string;
  date: string;

  patients: PatientOption[];
  therapists: TherapistColumn[];

  isWorking: boolean;
}

export function ScheduleCell({
  appointment,
  therapist,
  slot,
  date,
  patients,
  therapists,
  isWorking,
}: Props) {
  const [open, setOpen] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Existing Appointment
  |--------------------------------------------------------------------------
  |
  | Always show existing appointments.
  |
  | This is important if working hours are changed
  | after an appointment was already booked.
  |
  */

  if (appointment) {
    return (
      <div className="border-r border-b p-1">
        <AppointmentCard
          appointment={
            appointment
          }
          therapists={
            therapists
          }
        />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Therapist Not Working
  |--------------------------------------------------------------------------
  */

  if (!isWorking) {
    return (
      <div className="min-h-[64px] border-r border-b bg-slate-100">
        <div className="flex h-full min-h-[64px] items-center justify-center text-xs font-medium text-slate-300">
          —
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Available Slot
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-[64px] border-r border-b p-1">
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        className="flex h-full min-h-[56px] w-full items-center justify-center rounded-md text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
      >
        +
      </button>

      <CreateAppointmentDialog
        open={open}
        onClose={() =>
          setOpen(false)
        }
        therapistId={
          therapist.id
        }
        therapistName={
          therapist.name
        }
        slot={slot}
        date={date}
        patients={patients}
      />
    </div>
  );
}