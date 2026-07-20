import {
  SESSION_DURATION,
  CLINIC_OPEN_HOUR,
  CLINIC_CLOSE_HOUR,
} from "@/features/schedule/constants";

export function generateTimeSlots() {
  const slots: string[] = [];

  const current = new Date();
  current.setHours(CLINIC_OPEN_HOUR, 0, 0, 0);

  const end = new Date();
  end.setHours(CLINIC_CLOSE_HOUR, 0, 0, 0);

  while (current < end) {
    const hour = String(current.getHours()).padStart(2, "0");
    const minute = String(current.getMinutes()).padStart(2, "0");

    slots.push(`${hour}:${minute}`);

    current.setMinutes(
      current.getMinutes() + SESSION_DURATION
    );
  }

  return slots;
}