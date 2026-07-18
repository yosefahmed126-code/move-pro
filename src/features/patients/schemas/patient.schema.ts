import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(3, "Patient name is required"),

  mobile: z.string().min(11, "Mobile must be 11 digits"),

  branchId: z
    .number({
      required_error: "Branch is required",
    })
    .min(1, "Branch is required"),

  packageId: z
    .number({
      required_error: "Package is required",
    })
    .min(1, "Package is required"),

  therapist: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;