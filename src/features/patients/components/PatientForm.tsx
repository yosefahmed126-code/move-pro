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

  patient?: {
    id: number;
    name: string;
    mobile: string;
    therapist: string | null;
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

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: patient?.name ?? "",
    mobile: patient?.mobile ?? "",
    branchId: patient?.branchId ?? 0,
    packageId: patient?.packageId ?? 0,
    therapist: patient?.therapist ?? "",
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
            Branch
          </label>

          <select
            className="w-full rounded-lg border p-3"
            value={form.branchId}
            onChange={(e) =>
              setForm({
                ...form,
                branchId: Number(e.target.value),
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
            value={form.packageId}
            onChange={(e) =>
              setForm({
                ...form,
                packageId: Number(e.target.value),
              })
            }
          >
            <option value={0}>Select Package</option>

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

          <input
            className="w-full rounded-lg border p-3"
            value={form.therapist}
            onChange={(e) =>
              setForm({
                ...form,
                therapist: e.target.value,
              })
            }
          />
        </div>

        <div className="flex justify-end gap-3 md:col-span-2">
          <button
            type="button"
            className="rounded-lg border px-6 py-3"
            onClick={() => router.push("/patients")}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-cyan-600 px-6 py-3 text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Patient"}
          </button>
        </div>
      </form>
    </div>
  );
}