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

interface Props {
  open: boolean;
  onClose: () => void;

  therapistId: number;
  therapistName: string;

  slot: string;
  date: Date;
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
}: Props)
{
  return (
    
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
        </DialogHeader>

        <AppointmentForm
  therapistName={therapistName}
  slot={slot}
  date={date}
  patients={patients}
 onSubmit={async (values) => {
  const patient = patients.find(
    (p) => p.id === Number(values.patientId)
  );

  if (!patient) {
    alert("Please select a patient.");
    return;
  }

 const [hours, minutes] = slot.split(":").map(Number);

const startTime = new Date(date);
startTime.setHours(hours, minutes, 0, 0);

const endTime = new Date(startTime);
endTime.setMinutes(endTime.getMinutes() + 40);

await createAppointment({
  patientId: patient.id,
  therapistId,
  branchId: patient.branchId,
  date,
  startTime,
  endTime,
  notes: values.notes,
});

onClose();
}}
/>
           
      </DialogContent>
    </Dialog>
  );
}