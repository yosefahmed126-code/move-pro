import DashboardLayout from "@/components/layout/DashboardLayout";
import PatientForm from "@/features/patients/components/PatientForm";
import { prisma } from "@/lib/prisma";

export default async function NewPatientPage() {
  const branches = await prisma.branch.findMany({
    where: {
      status: "Active",
    },
    orderBy: {
      name: "asc",
    },
  });

  const packages = await prisma.package.findMany({
    where: {
      status: "Active",
    },
    orderBy: {
      sessions: "asc",
    },
    select: {
      id: true,
      name: true,
      sessions: true,
    },
  });

  const therapists = await prisma.therapist.findMany({
    where: {
      status: "Active",
    },
    orderBy: {
      name: "asc",
    },
  });

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

        <PatientForm
          mode="create"
          branches={branches}
          packages={packages}
          therapists={therapists}
        />
      </div>
    </DashboardLayout>
  );
}