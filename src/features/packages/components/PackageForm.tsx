"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createPackage } from "../actions/createPackage";
import { updatePackage } from "../actions/updatePackage";

interface PackageFormProps {
  packageData?: {
    id: number;
    name: string;
    sessions: number;
    price: number;
    allowedExcuses: number;
    status: string;
  };
}

export default function PackageForm({
  packageData,
}: PackageFormProps) {
  const router = useRouter();

  const [name, setName] = useState(packageData?.name ?? "");
  const [sessions, setSessions] = useState(
    packageData?.sessions ?? 1
  );
  const [price, setPrice] = useState(
    packageData?.price ?? 0
  );
  const [allowedExcuses, setAllowedExcuses] = useState(
    packageData?.allowedExcuses ?? 0
  );
  const [status, setStatus] = useState(
    packageData?.status ?? "Active"
  );

  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    if (packageData) {
      await updatePackage(packageData.id, {
        name,
        sessions,
        price,
        allowedExcuses,
        status,
      });
    } else {
      await createPackage({
        name,
        sessions,
        price,
        allowedExcuses,
        status,
      });
    }

    setLoading(false);

    router.push("/packages");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">
          Package Name
        </label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border p-3"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Sessions
          </label>

          <input
            type="number"
            min={1}
            value={sessions}
            onChange={(e) =>
              setSessions(Number(e.target.value))
            }
            className="w-full rounded-lg border p-3"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Price
          </label>

          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) =>
              setPrice(Number(e.target.value))
            }
            className="w-full rounded-lg border p-3"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Allowed Excuses
          </label>

          <input
            type="number"
            min={0}
            value={allowedExcuses}
            onChange={(e) =>
              setAllowedExcuses(Number(e.target.value))
            }
            className="w-full rounded-lg border p-3"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Status
          </label>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="w-full rounded-lg border p-3"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-cyan-600 px-6 py-3 text-white transition hover:bg-cyan-700 disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : packageData
          ? "Update Package"
          : "Create Package"}
      </button>
    </form>
  );
}