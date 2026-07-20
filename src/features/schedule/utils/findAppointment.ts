import type { ScheduleAppointment } from "@/features/appointments/types";

export function findAppointment(
  appointments: ScheduleAppointment[],
  therapistId: number,
  slot: string
) {
  return appointments.find((appointment) => {
   const appointmentTime = new Date(
  appointment.startTime
).toLocaleTimeString("en-GB", {
  timeZone: "Africa/Cairo",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
    console.log({
      slot,
      appointmentTime,
      therapistId,
      appointmentTherapist: appointment.therapistId,
    });

    return (
      appointment.therapistId === therapistId &&
      appointmentTime === slot
    );
  });
}