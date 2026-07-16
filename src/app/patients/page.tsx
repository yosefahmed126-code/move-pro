import Link from "next/link";

import DashboardLayout from "@/components/layout/DashboardLayout";
import PatientToolbar from "@/features/patients/components/PatientToolbar";
import PatientsTable from "@/features/patients/components/PatientsTable";
import { prisma } from "@/lib/prisma";
interface Props {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function PatientsPage({
  searchParams,
}: Props) {
 const patients = await prisma.patient.findMany({
  orderBy: {
    id: "desc",
  },
});

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Patients
            </h1>

            <p className="mt-1 text-slate-500">
              Manage all patients and their information.
            </p>
          </div>

          <Link
            href="/patients/new"
            className="rounded-lg bg-cyan-600 px-5 py-2 text-white transition hover:bg-cyan-700"
          >
            + Add Patient
          </Link>
        </div>

        <PatientToolbar />

        <PatientsTable patients={patients} />
      </div>
    </DashboardLayout>
  );
}