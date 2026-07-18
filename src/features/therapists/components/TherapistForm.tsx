"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTherapist } from "../actions/createTherapist";
import { updateTherapist } from "../actions/updateTherapist";

interface Props {
  mode: "create" | "edit";

  branches: {
    id: number;
    name: string;
  }[];

  therapist?: {
    id: number;
    name: string;
    mobile: string | null;
    email: string | null;
    specialty: string | null;
    notes: string | null;
    branchId: number;
  };
}

export default function TherapistForm({
  mode,
  therapist,
  branches,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: therapist?.name ?? "",
    mobile: therapist?.mobile ?? "",
    email: therapist?.email ?? "",
    specialty: therapist?.specialty ?? "",
    notes: therapist?.notes ?? "",
    branchId: therapist?.branchId ?? 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    let result;

    if (mode === "create") {
      result = await createTherapist(form);
    } else {
      result = await updateTherapist({
        id: therapist!.id,
        ...form,
      });
    }

    setLoading(false);

    if (result.success) {
      router.push("/therapists");
      router.refresh();
    } else {
      alert(result.message ?? "Please check the entered data.");
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
            Specialty
          </label>

          <input
            className="w-full rounded-lg border p-3"
            value={form.specialty}
            onChange={(e) =>
              setForm({
                ...form,
                specialty: e.target.value,
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
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block font-medium">
            Notes
          </label>

          <textarea
            rows={4}
            className="w-full rounded-lg border p-3"
            value={form.notes}
            onChange={(e) =>
              setForm({
                ...form,
                notes: e.target.value,
              })
            }
          />
        </div>

        <div className="flex justify-end gap-3 md:col-span-2">
          <button
            type="button"
            onClick={() => router.push("/therapists")}
            className="rounded-lg border px-6 py-3"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-cyan-600 px-6 py-3 text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Therapist"}
          </button>
        </div>
      </form>
    </div>
  );
}