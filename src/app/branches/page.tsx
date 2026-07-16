    import Link from "next/link";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { getBranches } from "@/features/branches/actions/getBranches";
export default async function BranchesPage() {
  const branches = await getBranches();

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Branches
            </h1>

            <p className="mt-1 text-slate-500">
              Manage clinic branches.
            </p>
          </div>

          <Link
            href="/branches/new"
            className="rounded-lg bg-cyan-600 px-5 py-2 text-white transition hover:bg-cyan-700"
          >
            + Add Branch
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left">Branch Name</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {branches.map((branch) => (
                <tr
                  key={branch.id}
                  className="border-t"
                >
                  <td className="px-4 py-3">
                    {branch.name}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {branch.status}
                  </td>
                </tr>
              ))}

              {branches.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="py-8 text-center text-slate-500"
                  >
                    No branches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
}