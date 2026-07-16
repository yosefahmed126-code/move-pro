import DashboardLayout from "@/components/layout/DashboardLayout";
import PatientForm from "@/features/patients/components/PatientForm";

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

        <PatientForm mode="create" />
      </div>
    </DashboardLayout>
  );
}