"use client";

import { useState } from "react";
import {
  Clock,
  Hash,
} from "lucide-react";

import { APPOINTMENT_STATUS } from "@/features/appointments/constants";
import type { ScheduleAppointment } from "@/features/appointments/types";
import type { TherapistColumn } from "../types";

import { AppointmentDetailsDialog } from "../dialogs/AppointmentDetailsDialog";

interface Props {
  appointment: ScheduleAppointment;
  therapists: TherapistColumn[];
}

export function AppointmentCard({
  appointment,
  therapists,
}: Props) {
  const [open, setOpen] = useState(false);

  const appointmentStatus =
    APPOINTMENT_STATUS[appointment.status];

  const startTime = formatTime(
    appointment.startTime
  );

  const endTime = formatTime(
    appointment.endTime
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group w-full rounded-lg border-l-4 p-2.5 text-left text-sm transition hover:-translate-y-[1px] hover:shadow-md ${appointmentStatus.color}`}
      >
        {/* Patient */}

        <div className="truncate font-semibold">
          {appointment.patient.name}
        </div>

        {/* Time + Session */}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] opacity-75">
          <span className="flex items-center gap-1">
            <Clock size={12} />

            {startTime}
            {" - "}
            {endTime}
          </span>

          <span className="flex items-center gap-1">
            <Hash size={12} />

            Session {appointment.sessionNumber}
          </span>
        </div>

        {/* Status */}

        <div className="mt-2">
          <span className="inline-flex rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-semibold">
            {appointmentStatus.label}
          </span>
        </div>
      </button>

      <AppointmentDetailsDialog
        open={open}
        onClose={() => setOpen(false)}
        appointment={appointment}
        therapists={therapists}
      />
    </>
  );
}

/*
|--------------------------------------------------------------------------
| Format Time
|--------------------------------------------------------------------------
*/

function formatTime(
  value: Date | string
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  );
}