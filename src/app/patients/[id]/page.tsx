import DashboardLayout from "@/components/layout/DashboardLayout";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function PatientDetailsPage({ params }: Props) {
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
            {patient.name}
          </h1>

          <p className="mt-2 text-slate-500">
            Patient Details
          </p>
        </div>

        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <div className="grid grid-cols-2 gap-6">

            <Info label="Code" value={patient.code} />
            <Info label="Mobile" value={patient.mobile} />

            <Info label="Branch" value={patient.branch} />
            <Info label="Therapist" value={patient.therapist} />

            <Info label="Package" value={patient.package} />
            <Info
              label="Remaining Sessions"
              value={patient.remaining.toString()}
            />

            <Info label="Status" value={patient.status} />

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-medium">
        {value || "-"}
      </p>
    </div>
  );
}