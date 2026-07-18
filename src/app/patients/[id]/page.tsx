import { notFound } from "next/navigation";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

function Info({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

export default async function PatientDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const patientId = Number(id);

  if (!Number.isInteger(patientId)) {
    notFound();
  }

  const patient = await prisma.patient.findUnique({
    where: {
      id: patientId,
    },
    include: {
      branch: true,
      package: true,
    },
  });

  if (!patient) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            {patient.name}
          </h1>

          <p className="text-slate-500">
            Patient Code: {patient.code}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Info label="Code" value={patient.code} />
          <Info label="Mobile" value={patient.mobile} />
          <Info
            label="Therapist"
            value={patient.therapist ?? "-"}
          />
          <Info
            label="Branch"
            value={patient.branch.name}
          />
          <Info
            label="Package"
            value={patient.package?.name ?? "-"}
          />
          <Info
            label="Remaining Sessions"
            value={patient.remaining}
          />
          <Info
            label="Status"
            value={patient.status}
          />
          <Info
            label="Created At"
            value={patient.createdAt.toLocaleDateString()}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}