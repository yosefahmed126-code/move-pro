import DashboardLayout from "@/components/layout/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PatientForm from "@/features/patients/components/PatientForm";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPatientPage({ params }: Props) {
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!patient) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Edit Patient
          </h1>

          <p className="mt-2 text-slate-500">
            Update patient information.
          </p>
        </div>

        <PatientForm
  mode="edit"
  patient={patient}
/>
      </div>
    </DashboardLayout>
  );
}