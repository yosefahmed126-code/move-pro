import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(3, "Patient name is required"),
  mobile: z.string().min(11, "Mobile must be 11 digits"),
  branch: z.string().min(2, "Branch is required"),
  therapist: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;