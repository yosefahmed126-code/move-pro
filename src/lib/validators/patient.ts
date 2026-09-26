import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Shared Patient Fields
|--------------------------------------------------------------------------
*/

const PatientBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      3,
      "Patient name must be at least 3 characters"
    ),

  gender: z
    .enum(["Male", "Female"])
    .or(z.literal(""))
    .optional(),

  birthDate: z.string().optional(),

  mobile: z
    .string()
    .trim()
    .regex(
      /^01[0125][0-9]{8}$/,
      "Please enter a valid Egyptian mobile number"
    ),

  mobile2: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        /^01[0125][0-9]{8}$/.test(value),
      "Please enter a valid Egyptian mobile number"
    )
    .optional(),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .or(z.literal(""))
    .optional(),

  nationalId: z
    .string()
    .trim()
    .optional(),

  address: z
    .string()
    .trim()
    .optional(),
});

/*
|--------------------------------------------------------------------------
| Create Patient
|--------------------------------------------------------------------------
|
| Creating a patient also creates the first PatientPackage.
| Therefore Branch and Package are required.
|
*/

export const CreatePatientSchema =
  PatientBaseSchema.extend({
    branchId: z
      .number()
      .min(1, "Please select a branch"),

    packageId: z
  .number()
  .min(1, "Please select a package"),
  });

/*
|--------------------------------------------------------------------------
| Update Patient
|--------------------------------------------------------------------------
|
| Editing a patient only changes personal information.
| Package and Branch are managed separately.
|
*/

export const UpdatePatientSchema =
  PatientBaseSchema;

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export type CreatePatientFormData = z.infer<
  typeof CreatePatientSchema
>;

export type UpdatePatientFormData = z.infer<
  typeof UpdatePatientSchema
>;