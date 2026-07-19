"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { PatientSchema, PatientFormData } from "@/lib/validators/patient";

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

  therapists: {
    id: number;
    name: string;
    branchId: number;
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
    therapistId: number | null;
    branchId: number;
    packageId: number | null;
  };
}
export default function PatientForm({
  mode,
  patient,
  branches,
  packages,
  therapists,
}: Props) {

  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(PatientSchema),

    defaultValues: {
      name: patient?.name ?? "",
      gender: patient?.gender ?? "",
      birthDate: patient?.birthDate ?? "",
      mobile: patient?.mobile ?? "",
      mobile2: patient?.mobile2 ?? "",
      email: patient?.email ?? "",
      nationalId: patient?.nationalId ?? "",
      address: patient?.address ?? "",
      therapistId: patient?.therapistId ?? null,
      branchId: patient?.branchId ?? 0,
      packageId: patient?.packageId ?? null,
    },
  });

  const selectedBranch = watch("branchId");

const filteredTherapists = useMemo(() => {
  return (therapists ?? []).filter(
  (t) => t.branchId === selectedBranch
);
}, [selectedBranch, therapists]);

const onSubmit = async (data: PatientFormData) => {

  const result =
  mode === "create"
    ? await createPatient({
        ...data,
        packageId: data.packageId,
        therapistId: data.therapistId,
      })
    : await updatePatient({
        id: patient!.id,
        ...data,
        packageId: data.packageId,
        therapistId: data.therapistId,
      });
  if (!result.success) {
    toast.error(result.message);
    return;
  }

  toast.success(result.message);

  router.push("/patients");
  router.refresh();
};
 
return (
  <form
    onSubmit={handleSubmit(onSubmit)}
    className="space-y-6"
  >
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
          { value: "Male", label: "Male" },
          { value: "Female", label: "Female" },
        ]}
        onChange={(value) =>
          setValue("gender", value)
        }
        error={errors.gender}
      />

      <TextInput
        label="Birth Date"
        type="date"
        registration={register("birthDate")}
        error={errors.birthDate}
      />

      <TextInput
        label="National ID"
        registration={register("nationalId")}
        error={errors.nationalId}
      />

    </FormSection>

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
          registration={register("address")}
          error={errors.address}
        />
      </div>

    </FormSection>

        <FormSection title="Clinic Information">

      <SelectInput
        label="Branch"
        value={watch("branchId")}
        options={branches.map((branch) => ({
          value: branch.id,
          label: branch.name,
        }))}
        onChange={(value) => {
          setValue("branchId", Number(value));
          setValue("therapistId", null);
        }}
        error={errors.branchId}
      />

      <SelectInput
        label="Therapist"
        value={watch("therapistId") ?? ""}
        options={filteredTherapists.map((therapist) => ({
          value: therapist.id,
          label: therapist.name,
        }))}
        onChange={(value) =>
          setValue(
            "therapistId",
            value ? Number(value) : null
          )
        }
        error={errors.therapistId}
      />

      <SelectInput
        label="Package"
        value={watch("packageId") ?? ""}
        options={packages.map((pkg) => ({
          value: pkg.id,
          label: `${pkg.name} (${pkg.sessions} Sessions)`,
        }))}
        onChange={(value) =>
          setValue(
            "packageId",
            value ? Number(value) : null
          )
        }
        error={errors.packageId}
      />

    </FormSection>

        <div className="flex justify-end gap-3">

      <button
        type="button"
        onClick={() => router.push("/patients")}
        className="rounded-lg border px-6 py-3"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-cyan-600 px-6 py-3 text-white transition hover:bg-cyan-700 disabled:opacity-50"
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
