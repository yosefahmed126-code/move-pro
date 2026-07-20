import { z } from "zod";

export const AppointmentSchema = z.object({
  patientId: z
    .number({
      error: "Please select a patient.",
    })
    .positive(),

  therapistId: z
    .number({
      error: "Please select a therapist.",
    })
    .positive(),

  branchId: z
    .number({
      error: "Please select a branch.",
    })
    .positive(),

  date: z.string().min(1, "Please select a date."),

  startTime: z.string().min(1, "Please select a start time."),

  duration: z.number().default(40),

  notes: z.string().optional(),
});

export type AppointmentFormData = z.infer<
  typeof AppointmentSchema
>;