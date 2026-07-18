import { z } from "zod";

export const therapistSchema = z.object({
  name: z
    .string()
    .min(3, "Therapist name is required"),

  mobile: z.string().optional(),

  email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),

  specialty: z.string().optional(),

  notes: z.string().optional(),

  branchId: z
    .number({
      required_error: "Branch is required",
    })
    .min(1, "Branch is required"),
});

export type TherapistFormData = z.infer<
  typeof therapistSchema
>;