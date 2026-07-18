import DashboardLayout from "@/components/layout/DashboardLayout";
import PatientForm from "@/features/patients/components/PatientForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPatientPage({
  params,
}: Props) {
  const { id } = await params;

  const therapists = await prisma.therapist.findMany({
  orderBy: {
    name: "asc",
  },
});

  const patient = await prisma.patient.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      branch: true,
      package: true,
    },
  });

  if (!patient) {
    notFound();
  }

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
          branches={branches}
          packages={packages}
          therapists={therapists}
          patient={{
            id: patient.id,
            name: patient.name,
            mobile: patient.mobile,
            therapist: patient.therapist,
            branchId: patient.branchId,
            packageId: patient.packageId,
          }}
        />
      </div>
    </DashboardLayout>
  );
}