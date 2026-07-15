import DashboardLayout from "@/components/layout/DashboardLayout";

export default function NewPatientPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8">

        <div>
          <h1 className="text-3xl font-bold">
            Add New Patient
          </h1>

          <p className="text-slate-500 mt-2">
            Create a new patient record.
          </p>
        </div>

        <div className="rounded-xl border bg-white p-8 shadow-sm">

          <h2 className="text-xl font-semibold mb-6">
            Patient Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block mb-2 font-medium">
                Patient Code
              </label>

              <input
                className="w-full rounded-lg border p-3"
                disabled
                value="Auto Generated"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Full Name
              </label>

              <input
                className="w-full rounded-lg border p-3"
                placeholder="Enter patient name"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Mobile
              </label>

              <input
                className="w-full rounded-lg border p-3"
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Branch
              </label>

              <input
                className="w-full rounded-lg border p-3"
                placeholder="Branch"
              />
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}