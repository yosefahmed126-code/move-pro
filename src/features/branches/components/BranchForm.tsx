"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BranchStatus } from "@prisma/client";

import { createBranch } from "../actions/createBranch";
import { updateBranch } from "../actions/updateBranch";

interface Props {
  mode: "create" | "edit";
  branch?: {
    id: number;
    name: string;
    status: BranchStatus;
  };
}

export default function BranchForm({
  mode,
  branch,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(
    branch?.name ?? ""
  );

  const [status, setStatus] =
    useState<BranchStatus>(
      branch?.status ?? BranchStatus.ACTIVE
    );

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    let result;

    if (mode === "create") {
      result = await createBranch({
        name,
        status,
      });
    } else {
      result = await updateBranch({
        id: branch!.id,
        name,
        status,
      });
    }

    setLoading(false);

    if (result.success) {
      router.push("/branches");
      router.refresh();
    } else {
      alert("Something went wrong.");
    }
  }

  return (
    <div className="rounded-xl border bg-white p-8 shadow-sm">
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <label className="mb-2 block font-medium">
            Branch Name
          </label>

          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full rounded-lg border p-3"
            placeholder="Enter branch name"
            required
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Status
          </label>

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value as BranchStatus
              )
            }
            className="w-full rounded-lg border p-3"
          >
            <option value={BranchStatus.ACTIVE}>
              Active
            </option>

            <option value={BranchStatus.INACTIVE}>
              Inactive
            </option>
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              router.push("/branches")
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
              : mode === "create"
                ? "Save Branch"
                : "Update Branch"}
          </button>
        </div>
      </form>
    </div>
  );
}