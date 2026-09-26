"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  CreatePatientSchema,
  CreatePatientFormData,
} from "@/lib/validators/patient";

import { createPatient } from "../actions/createPatient";
import { updatePatient } from "../actions/updatePatient";

import FormSection from "@/components/forms/FormSection";
import TextInput from "@/components/forms/TextInput";
import SelectInput from "@/components/forms/SelectInput";
import TextArea from "@/components/forms/TextArea";

interface Props {
  mode: "create" | "edit";

  branches: {
    id: number;
    name: string;
  }[];

  packages: {
    id: number;
    name: string;
    sessions: number;
  }[];

  patient?: {
    id: number;

    name: string;
    gender: string | null;
    birthDate: string;

    mobile: string;
    mobile2: string | null;

    email: string | null;
    nationalId: string | null;
    address: string | null;

    branchId: number;
    packageId: number | null;
  };
}

export default function PatientForm({
  mode,
  patient,
  branches,
  packages,
}: Props) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<CreatePatientFormData>({
    resolver: zodResolver(CreatePatientSchema),

    defaultValues: {
      name: patient?.name ?? "",

      gender:
        patient?.gender === "Male" ||
        patient?.gender === "Female"
          ? patient.gender
          : "",

      birthDate:
        patient?.birthDate ?? "",

      mobile:
        patient?.mobile ?? "",

      mobile2:
        patient?.mobile2 ?? "",

      email:
        patient?.email ?? "",

      nationalId:
        patient?.nationalId ?? "",

      address:
        patient?.address ?? "",

      branchId:
        patient?.branchId ?? 0,

      packageId:
  patient?.packageId ?? 0,
    },
  });

  const onSubmit = async (
    data: CreatePatientFormData
  ) => {
    try {
      if (mode === "create") {
        const result =
          await createPatient(data);

        if (!result.success) {
          toast.error(
            result.message ??
              "Something went wrong."
          );

          return;
        }

        toast.success(result.message);

        router.push(
          `/patients/${result.patientId}`
        );

        router.refresh();

        return;
      }

      if (!patient) {
        toast.error("Patient not found.");
        return;
      }

      const result = await updatePatient({
        id: patient.id,

        name: data.name,
        gender: data.gender,
        birthDate: data.birthDate,

        mobile: data.mobile,
        mobile2: data.mobile2,

        email: data.email,
        nationalId: data.nationalId,
        address: data.address,
      });

      if (!result.success) {
        toast.error(
          result.message ??
            "Something went wrong."
        );

        return;
      }

      toast.success(result.message);

      router.push(
        `/patients/${patient.id}`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "PATIENT_FORM_ERROR:",
        error
      );

      toast.error(
        "Something went wrong while saving the patient."
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Patient Information */}

      <FormSection title="Patient Information">
        <TextInput
          label="Full Name"
          required
          registration={register("name")}
          error={errors.name}
        />

        <SelectInput
          label="Gender"
          value={watch("gender") ?? ""}
          options={[
            {
              value: "Male",
              label: "Male",
            },
            {
              value: "Female",
              label: "Female",
            },
          ]}
          onChange={(value) =>
            setValue(
              "gender",
              value as "Male" | "Female" | "",
              {
                shouldValidate: true,
              }
            )
          }
          error={errors.gender}
        />

        <TextInput
          label="Birth Date"
          type="date"
          registration={register(
            "birthDate"
          )}
          error={errors.birthDate}
        />

        <TextInput
          label="National ID"
          registration={register(
            "nationalId"
          )}
          error={errors.nationalId}
        />
      </FormSection>

      {/* Contact Information */}

      <FormSection title="Contact Information">
        <TextInput
          label="Mobile"
          required
          registration={register("mobile")}
          error={errors.mobile}
        />

        <TextInput
          label="Mobile 2"
          registration={register("mobile2")}
          error={errors.mobile2}
        />

        <TextInput
          label="Email"
          type="email"
          registration={register("email")}
          error={errors.email}
        />

        <div className="md:col-span-2">
          <TextArea
            label="Address"
            registration={register(
              "address"
            )}
            error={errors.address}
          />
        </div>
      </FormSection>

      {/* Clinic Information */}

      {mode === "create" && (
        <FormSection title="Clinic Information">
          <SelectInput
            label="Branch"
            value={watch("branchId")}
            options={branches.map(
              (branch) => ({
                value: branch.id,
                label: branch.name,
              })
            )}
            onChange={(value) =>
              setValue(
                "branchId",
                Number(value),
                {
                  shouldValidate: true,
                }
              )
            }
            error={errors.branchId}
          />

          <SelectInput
            label="Package"
            value={
              watch("packageId") ?? ""
            }
            options={packages.map(
              (pkg) => ({
                value: pkg.id,

                label: `${pkg.name} (${pkg.sessions} Sessions)`,
              })
            )}
           onChange={(value) =>
  setValue(
    "packageId",
    value
      ? Number(value)
      : 0,
    {
      shouldValidate: true,
    }
  )
}
            error={errors.packageId}
          />
        </FormSection>
      )}

      {/* Actions */}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => {
            if (
              mode === "edit" &&
              patient
            ) {
              router.push(
                `/patients/${patient.id}`
              );

              return;
            }

            router.push("/patients");
          }}
          className="rounded-lg border px-6 py-3 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-cyan-600 px-6 py-3 text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : mode === "create"
              ? "Create Patient"
              : "Update Patient"}
        </button>
      </div>
    </form>
  );
}