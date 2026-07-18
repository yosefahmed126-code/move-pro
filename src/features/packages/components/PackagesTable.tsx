"use client";

import type { Package } from "../types";
import PackageActions from "./PackageActions";

interface Props {
  packages: Package[];
}

export default function PackagesTable({
  packages,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-100">
          <tr className="text-left text-sm font-semibold text-slate-600">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3 text-center">Sessions</th>
            <th className="px-4 py-3 text-center">Price</th>
            <th className="px-4 py-3 text-center">
              Allowed Excuses
            </th>
            <th className="px-4 py-3 text-center">
              Patients
            </th>
            <th className="px-4 py-3 text-center">
              Status
            </th>
            <th className="px-4 py-3 text-center">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {packages.map((pkg) => (
            <tr
              key={pkg.id}
              className="border-t hover:bg-slate-50 transition-colors"
            >
              <td className="px-4 py-3 font-medium">
                {pkg.name}
              </td>

              <td className="px-4 py-3 text-center">
                {pkg.sessions}
              </td>

              <td className="px-4 py-3 text-center">
                EGP {pkg.price.toFixed(2)}
              </td>

              <td className="px-4 py-3 text-center">
                {pkg.allowedExcuses}
              </td>

              <td className="px-4 py-3 text-center">
                {"patientsCount" in pkg
                  ? (pkg as any).patientsCount
                  : 0}
              </td>

              <td className="px-4 py-3 text-center">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    pkg.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {pkg.status}
                </span>
              </td>

              <td className="px-4 py-3">
                <PackageActions packageId={pkg.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}