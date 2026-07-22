import { Fragment } from "react";
import { generateTimeSlots } from "@/lib/appointments/timeSlots";
import { ScheduleCell } from "./ScheduleCell";
import { findAppointment } from "../utils/findAppointment";
import type { ScheduleGridProps } from "../types";

export function ScheduleGrid({
  therapists,
  appointments,
  patients,
}: ScheduleGridProps) {
  const slots = generateTimeSlots();

  console.log(appointments);

  return (
    <div className="overflow-auto rounded-xl border bg-white">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `120px repeat(${therapists.length}, minmax(250px,1fr))`,
        }}
      >
        <div className="sticky left-0 top-0 z-20 border-b bg-white p-4 font-semibold">
          Time
        </div>

        {therapists.map((therapist) => (
          <div
            key={therapist.id}
            className="border-b bg-white p-4 text-center font-semibold"
          >
            {therapist.name}
          </div>
        ))}
           
        {slots.map((slot) => (
          <Fragment key={slot}>
            <div className="sticky left-0 border-r border-b bg-white p-4 font-medium">
              {slot}
            </div>
                                        
            {therapists.map((therapist) => (
              <ScheduleCell
  key={`${slot}-${therapist.id}`}
  appointment={findAppointment(
    appointments,
    therapist.id,
    slot
  )}
  therapist={therapist}
  slot={slot}
  date={new Date()}
  patients={patients}
/>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}