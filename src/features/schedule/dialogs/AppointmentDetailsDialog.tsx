"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { checkInAppointment } from "@/features/appointments/actions/checkInAppointment";
import type { ScheduleAppointment } from "@/features/appointments/types";

interface Props {
  open: boolean;
  onClose: () => void;
  appointment: ScheduleAppointment;
}

export function AppointmentDetailsDialog({
  open,
  onClose,
  appointment,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Appointment Details
          </DialogTitle>
        </DialogHeader>

<div>
  <p className="text-sm text-muted-foreground">
    Appointment Code
  </p>

  <p className="font-medium">
    {appointment.code}
  </p>
</div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Patient
            </p>

            <p className="font-medium">
              {appointment.patient.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Therapist
            </p>

            <p className="font-medium">
              {appointment.therapist.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Status
            </p>

            <span
  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
    appointment.status === "BOOKED"
      ? "bg-blue-100 text-blue-700"
      : appointment.status === "CHECKED_IN"
      ? "bg-green-100 text-green-700"
      : appointment.status === "EXCUSED"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700"
  }`}
>
  {appointment.status.replace("_", " ")}
</span>
          </div>
          <div>
  <p className="text-sm text-muted-foreground">
    Date
  </p>

  <p className="font-medium">
    {appointment.date.toLocaleDateString()}
  </p>
</div>

<div>
  <p className="text-sm text-muted-foreground">
    Time
  </p>

  <p className="font-medium">
    {appointment.startTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}
    {" - "}
    {appointment.endTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}
  </p>
</div>
<div>
  <p className="text-sm text-muted-foreground">
    Notes
  </p>

  <p className="font-medium">
    {appointment.notes?.trim()
      ? appointment.notes
      : "No notes"}
  </p>
</div>
        
              <div className="mt-6 flex justify-end gap-3 border-t pt-4">
<button
  type="button"
  disabled={appointment.status === "CHECKED_IN"}
  onClick={async () => {
    await checkInAppointment(appointment.id);
    onClose();
  }}
  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
>
  Check In
</button>

  <button
    type="button"
    className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-yellow-600"
  >
    Excuse
  </button>

  <button
    type="button"
    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
  >
    Missed
  </button>
</div>

        </div>
      </DialogContent>
    </Dialog>
  );
}