import { z } from "zod";

const workingHourSchema = z
  .object({
    dayOfWeek: z
      .number()
      .int()
      .min(0)
      .max(6),

    enabled: z.boolean(),

    startTime: z
      .string()
      .regex(
        /^\d{2}:\d{2}$/,
        "Invalid start time"
      ),

    endTime: z
      .string()
      .regex(
        /^\d{2}:\d{2}$/,
        "Invalid end time"
      ),
  })
  .refine(
    (value) =>
      !value.enabled ||
      value.startTime <
        value.endTime,
    {
      message:
        "End time must be after start time.",
      path: ["endTime"],
    }
  );

export const therapistSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      3,
      "Therapist name is required"
    ),

  mobile: z.string().optional(),

  email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),

  specialty: z.string().optional(),

  notes: z.string().optional(),

  branchId: z
    .number()
    .int()
    .min(
      1,
      "Branch is required"
    ),

  workingHours: z
    .array(workingHourSchema)
    .default([]),
});

export type TherapistFormData =
  z.infer<typeof therapistSchema>;