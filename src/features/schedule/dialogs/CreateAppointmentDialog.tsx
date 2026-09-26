"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { AppointmentForm } from "@/features/appointments/components/AppointmentForm";
import { createAppointment } from "@/features/appointments/actions/createAppointment";

import type { PatientOption } from "../types";

import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;

  therapistId: number;
  therapistName: string;

  slot: string;

  // YYYY-MM-DD
  date: string;

  patients: PatientOption[];
}

export function CreateAppointmentDialog({
  open,
  onClose,
  therapistId,
  therapistName,
  slot,
  date,
  patients,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            New Appointment
          </DialogTitle>
        </DialogHeader>

        <AppointmentForm
          therapistName={therapistName}
          slot={slot}
          date={date}
          patients={patients}
          onSubmit={async (values) => {
            /*
            |--------------------------------------------------------------------------
            | Selected Patient
            |--------------------------------------------------------------------------
            */

            const patient = patients.find(
              (patient) =>
                patient.id ===
                Number(values.patientId)
            );

            if (!patient) {
              toast.error(
                "Please select a patient."
              );

              return;
            }

            /*
            |--------------------------------------------------------------------------
            | Selected Date
            |--------------------------------------------------------------------------
            */

            const selectedDate = new Date(
              `${date}T12:00:00`
            );

            if (
              Number.isNaN(
                selectedDate.getTime()
              )
            ) {
              toast.error(
                "Invalid appointment date."
              );

              return;
            }

            /*
            |--------------------------------------------------------------------------
            | Start / End Time
            |--------------------------------------------------------------------------
            */

            const [hours, minutes] = slot
              .split(":")
              .map(Number);

            const startTime = new Date(
              selectedDate
            );

            startTime.setHours(
              hours,
              minutes,
              0,
              0
            );

            const endTime = new Date(
              startTime
            );

            endTime.setMinutes(
              endTime.getMinutes() + 40
            );

            /*
            |--------------------------------------------------------------------------
            | Appointment Date
            |--------------------------------------------------------------------------
            */

            const appointmentDate =
              new Date(selectedDate);

            appointmentDate.setHours(
              0,
              0,
              0,
              0
            );

            /*
            |--------------------------------------------------------------------------
            | Create Appointment
            |--------------------------------------------------------------------------
            */

            try {
              const result =
                await createAppointment({
                  patientPackageId:
                    patient.patientPackageId,

                  therapistId,

                  branchId:
                    patient.branchId,

                  date: appointmentDate,

                  startTime,

                  endTime,

                  notes: values.notes,
                });

              toast.success(
                result.message
              );

              onClose();
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Failed to create appointment."
              );
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}