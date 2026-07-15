import DashboardLayout from "@/components/layout/DashboardLayout";
import PatientToolbar from "@/features/patients/components/PatientToolbar";
import PatientsTable from "@/features/patients/components/PatientsTable";
import { patients } from "@/features/patients/data/patients";

export default function PatientsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Patients
            </h1>
            <p className="text-slate-500 mt-1">
              Manage all patients and their information.
            </p>
          </div>

          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-lg transition">
            + Add Patient
          </button>
        </div>

        {/* Toolbar */}
        <PatientToolbar />

        {/* Patients Table */}
        <PatientsTable patients={patients} />
      </div>
    </DashboardLayout>
  );
}