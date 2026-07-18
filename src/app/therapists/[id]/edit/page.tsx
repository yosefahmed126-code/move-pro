import DashboardLayout from "@/components/layout/DashboardLayout";
import TherapistForm from "@/features/therapists/components/TherapistForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTherapistPage({
  params,
}: Props) {
  const { id } = await params;

  const therapist = await prisma.therapist.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      branch: true,
    },
  });

  if (!therapist) {
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

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Edit Therapist
          </h1>

          <p className="mt-2 text-slate-500">
            Update therapist information.
          </p>
        </div>

        <TherapistForm
          mode="edit"
          branches={branches}
          therapist={{
            id: therapist.id,
            name: therapist.name,
            mobile: therapist.mobile,
            email: therapist.email,
            specialty: therapist.specialty,
            notes: therapist.notes,
            branchId: therapist.branchId,
          }}
        />
      </div>
    </DashboardLayout>
  );
}