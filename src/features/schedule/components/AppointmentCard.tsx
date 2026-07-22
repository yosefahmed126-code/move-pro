"use client";

import { useState } from "react";

import { APPOINTMENT_STATUS } from "@/features/appointments/constants";
import type { ScheduleAppointment } from "@/features/appointments/types";

import { AppointmentDetailsDialog } from "../dialogs/AppointmentDetailsDialog";

interface Props {
  appointment: ScheduleAppointment;
}

export function AppointmentCard({
  appointment,
}: Props) {
  const [open, setOpen] = useState(false);

  const appointmentStatus =
    APPOINTMENT_STATUS[appointment.status];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full rounded-lg border-l-4 p-2 text-left text-sm transition hover:opacity-90 hover:shadow-sm ${appointmentStatus.color}`}
      >
        <div className="truncate font-semibold">
          {appointment.patient.name}
        </div>

        <div className="mt-1 text-xs opacity-70">
          {appointmentStatus.label}
        </div>
      </button>

      <AppointmentDetailsDialog
        open={open}
        onClose={() => setOpen(false)}
        appointment={appointment}
      />
    </>
  );
}