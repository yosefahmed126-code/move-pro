import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";

import { getPackages } from "@/features/packages/actions/getPackages";
import PackagesTable from "@/features/packages/components/PackagesTable";

export default async function PackagesPage() {
  const packages = await getPackages();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Packages
            </h1>

            <p className="mt-1 text-slate-500">
              Manage treatment packages.
            </p>
          </div>

          <Link
            href="/packages/new"
            className="rounded-lg bg-cyan-600 px-5 py-2 text-white hover:bg-cyan-700"
          >
            + Add Package
          </Link>
        </div>

        <PackagesTable packages={packages} />
      </div>
    </DashboardLayout>
  );
}