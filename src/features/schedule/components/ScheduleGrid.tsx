import { Fragment } from "react";

import { generateTimeSlots } from "@/lib/appointments/timeSlots";

import { ScheduleCell } from "./ScheduleCell";
import { findAppointment } from "../utils/findAppointment";

import type { ScheduleGridProps } from "../types";

export function ScheduleGrid({
  therapists,
  appointments,
  patients,
  selectedDate,
}: ScheduleGridProps) {
  const allSlots = generateTimeSlots();

const slots = allSlots.filter(
  (slot) =>
    therapists.some((therapist) =>
      therapist.workingHours.some(
        (workingHour) =>
          isSlotInsideWorkingHours(
            slot,
            workingHour.startTime,
            workingHour.endTime
          )
      )
    )
);

  return (
    <div className="overflow-auto rounded-xl border bg-white">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `120px repeat(${therapists.length}, minmax(250px, 1fr))`,
        }}
      >
        {/* Time Header */}

        <div className="sticky left-0 top-0 z-20 border-b bg-white p-4 font-semibold">
          Time
        </div>

        {/* Therapist Headers */}

        {therapists.map(
          (therapist) => (
            <div
              key={therapist.id}
              className="border-b bg-white p-4 text-center font-semibold"
            >
              {therapist.name}
            </div>
          )
        )}

        {/* Schedule Rows */}

        {slots.map((slot) => (
          <Fragment key={slot}>
            {/* Time */}

            <div className="sticky left-0 border-r border-b bg-white p-4 font-medium">
              {formatSlotLabel(
                slot
              )}
            </div>

            {/* Therapist Cells */}

            {therapists.map(
              (therapist) => {
                const workingHour =
                  therapist.workingHours[0];

                const isWorking =
                  workingHour
                    ? isSlotInsideWorkingHours(
                        slot,
                        workingHour.startTime,
                        workingHour.endTime
                      )
                    : false;

                return (
                  <ScheduleCell
                    key={`${slot}-${therapist.id}`}
                    appointment={findAppointment(
                      appointments,
                      therapist.id,
                      slot
                    )}
                    therapist={
                      therapist
                    }
                    slot={slot}
                    date={
                      selectedDate
                    }
                    patients={
                      patients
                    }
                    therapists={
                      therapists
                    }
                    isWorking={
                      isWorking
                    }
                  />
                );
              }
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Slot Inside Working Hours
|--------------------------------------------------------------------------
|
| Example:
|
| Working: 13:00 -> 21:00
|
| 12:20 = unavailable
| 13:00 = available
| 20:20 = available
| 21:00 = unavailable
|
*/

function isSlotInsideWorkingHours(
  slot: string,
  startTime: string,
  endTime: string
) {
  const slotMinutes =
    timeToMinutes(slot);

  const startMinutes =
    timeToMinutes(startTime);

  const endMinutes =
    timeToMinutes(endTime);

  /*
  | A session lasts 40 minutes.
  | The whole session must fit inside
  | the therapist's working hours.
  */

  const sessionEndMinutes =
    slotMinutes + 40;

  return (
    slotMinutes >= startMinutes &&
    sessionEndMinutes <= endMinutes
  );
}

function timeToMinutes(
  time: string
) {
  const [hours, minutes] =
    time.split(":").map(Number);

  return hours * 60 + minutes;
}

/*
|--------------------------------------------------------------------------
| Display Time
|--------------------------------------------------------------------------
|
| Internal value stays:
| 13:00
|
| Schedule displays:
| 1:00
|
*/

function formatSlotLabel(
  slot: string
) {
  const [hourValue, minute] =
    slot.split(":");

  const hour24 =
    Number(hourValue);

  const hour12 =
    hour24 % 12 || 12;

  return `${hour12}:${minute}`;
}