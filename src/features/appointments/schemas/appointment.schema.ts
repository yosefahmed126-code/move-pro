import { z } from "zod";

export const appointmentSchema = z.object({
  patientPackageId: z
    .number()
    .positive(),

  therapistId: z
    .number()
    .positive(),

  branchId: z
    .number()
    .positive(),

  date: z.coerce.date(),

  startTime: z.coerce.date(),

  endTime: z.coerce.date(),

  notes: z
    .string()
    .optional(),
});

export type AppointmentInput = z.infer<
  typeof appointmentSchema
>;