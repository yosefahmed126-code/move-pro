import { z } from "zod";

export const appointmentSchema = z.object({
  patientId: z.number().positive(),
  therapistId: z.number().positive(),
  branchId: z.number().positive(),

  date: z.date(),
  startTime: z.date(),
  endTime: z.date(),

  notes: z.string().optional(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;