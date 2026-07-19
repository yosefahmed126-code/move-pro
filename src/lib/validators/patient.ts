import { z } from "zod";

export const PatientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Patient name must be at least 3 characters"),

  gender: z.string().optional(),

  birthDate: z.string().optional(),

  mobile: z
    .string()
    .trim()
    .min(11, "Mobile number must be 11 digits")
    .max(11, "Mobile number must be 11 digits"),

  mobile2: z.string().optional(),

  email: z
    .string()
    .email("Invalid email address")
    .or(z.literal(""))
    .optional(),

  nationalId: z.string().optional(),

  address: z.string().optional(),

  branchId: z
    .number()
    .min(1, "Please select a branch"),

  packageId: z
    .number()
    .nullable(),

  therapistId: z
    .number()
    .nullable(),
});

export type PatientFormData = z.infer<typeof PatientSchema>;