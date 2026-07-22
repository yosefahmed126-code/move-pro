"use client";

import { useState } from "react";
import { AppointmentCard } from "./AppointmentCard";
import { CreateAppointmentDialog } from "../dialogs/CreateAppointmentDialog";
import type { ScheduleAppointment } from "@/features/appointments/types";
import type { PatientOption } from "../types";
interface Props {
  appointment?: ScheduleAppointment;

  therapist: {
    id: number;
    name: string;
  };

  slot: string;
  date: Date;

  patients: PatientOption[];
}

export function ScheduleCell({
  appointment,
  therapist,
  slot,
  date,
  patients,
}: Props) {
  const [open, setOpen] = useState(false);

  if (!appointment) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="flex h-full w-full items-center justify-center rounded-md text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
        >
          +
        </button>

        <CreateAppointmentDialog
  open={open}
  onClose={() => setOpen(false)}
  therapistId={therapist.id}
  therapistName={therapist.name}
  slot={slot}
  date={date}
  patients={patients}
/>
      </>
    );
  }

  return (
    <div className="border-r border-b p-1">
      <AppointmentCard appointment={appointment} />
    </div>
  );
}