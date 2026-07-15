"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

export default function NewPatientPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Add New Patient
          </h1>

          <p className="mt-2 text-slate-500">
            Create a new patient record.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <form className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Full Name */}
            <div>
              <label className="mb-2 block font-medium">
                Full Name
              </label>

              <input
                className="w-full rounded-lg border p-3"
                placeholder="Enter patient name"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="mb-2 block font-medium">
                Mobile
              </label>

              <input
                className="w-full rounded-lg border p-3"
                placeholder="01XXXXXXXXX"
              />
            </div>

            {/* Branch */}
            <div>
              <label className="mb-2 block font-medium">
                Branch
              </label>

              <input
                className="w-full rounded-lg border p-3"
                placeholder="Branch"
              />
            </div>

            {/* Therapist */}
            <div>
              <label className="mb-2 block font-medium">
                Therapist
              </label>

              <input
                className="w-full rounded-lg border p-3"
                placeholder="Therapist"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border px-6 py-3"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-cyan-600 px-6 py-3 text-white hover:bg-cyan-700"
              >
                Save Patient
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}