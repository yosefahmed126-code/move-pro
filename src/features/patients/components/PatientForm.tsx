"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPatient } from "../actions/createPatient";
import { updatePatient } from "../actions/updatePatient";

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
    remaining: number;
    status: string;
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

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
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
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    let result;

    if (mode === "create") {
      result = await createPatient(form);
    } else {
      result = await updatePatient({
        id: patient!.id,
        ...form,
      });
    }

    setLoading(false);

    if (result.success) {
      router.push("/patients");
      router.refresh();
    } else {
      alert("Please check the entered data.");
    }
  }

  return (
    <div className="rounded-xl border bg-white p-8 shadow-sm">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        <div>
          <label className="mb-2 block font-medium">
            Full Name
          </label>

          <input
            className="w-full rounded-lg border p-3"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Gender
          </label>

          <select
            className="w-full rounded-lg border p-3"
            value={form.gender}
            onChange={(e) =>
              setForm({
                ...form,
                gender: e.target.value,
              })
            }
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Birth Date
          </label>

          <input
            type="date"
            className="w-full rounded-lg border p-3"
            value={form.birthDate}
            onChange={(e) =>
              setForm({
                ...form,
                birthDate: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Mobile
          </label>

          <input
            className="w-full rounded-lg border p-3"
            value={form.mobile}
            onChange={(e) =>
              setForm({
                ...form,
                mobile: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Mobile 2
          </label>

          <input
            className="w-full rounded-lg border p-3"
            value={form.mobile2}
            onChange={(e) =>
              setForm({
                ...form,
                mobile2: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Email
          </label>

          <input
            type="email"
            className="w-full rounded-lg border p-3"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            National ID
          </label>

          <input
            className="w-full rounded-lg border p-3"
            value={form.nationalId}
            onChange={(e) =>
              setForm({
                ...form,
                nationalId: e.target.value,
              })
            }
          />
        </div>

        <div className="md:col-span-2">
  <label className="mb-2 block font-medium">
    Address
  </label>

  <textarea
    rows={3}
    className="w-full rounded-lg border p-3"
    value={form.address}
    onChange={(e) =>
      setForm({
        ...form,
        address: e.target.value,
      })
    }
  />
</div>

                <div>
          <label className="mb-2 block font-medium">
            Branch
          </label>

          <select
            className="w-full rounded-lg border p-3"
            value={form.branchId}
            onChange={(e) =>
              setForm({
                ...form,
                branchId: Number(e.target.value),
                therapistId: null,
              })
            }
          >
            <option value={0}>Select Branch</option>

            {branches.map((branch) => (
              <option
                key={branch.id}
                value={branch.id}
              >
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Package
          </label>

          <select
            className="w-full rounded-lg border p-3"
            value={form.packageId ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                packageId: e.target.value
                  ? Number(e.target.value)
                  : null,
              })
            }
          >
            <option value="">Select Package</option>

            {packages.map((pkg) => (
              <option
                key={pkg.id}
                value={pkg.id}
              >
                {pkg.name} ({pkg.sessions} Sessions)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Therapist
          </label>

          <select
            className="w-full rounded-lg border p-3"
            value={form.therapistId ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                therapistId: e.target.value
                  ? Number(e.target.value)
                  : null,
              })
            }
          >
            <option value="">
              Select Therapist
            </option>

            {therapists
              .filter(
                (therapist) =>
                  therapist.branchId ===
                  form.branchId
              )
              .map((therapist) => (
                <option
                  key={therapist.id}
                  value={therapist.id}
                >
                  {therapist.name}
                </option>
              ))}
          </select>
</div>

<div className="md:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              router.push("/patients")
            }
            className="rounded-lg border px-6 py-3"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-cyan-600 px-6 py-3 text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : "Save Patient"}
          </button>
        </div>
      </form>
    </div>
  );
}
