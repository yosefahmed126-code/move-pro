import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import TherapistForm from "@/features/therapists/components/TherapistForm";
import { prisma } from "@/lib/prisma";

export default async function NewTherapistPage() {
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
      <PageHeader
        title="Add Therapist"
        description="Create a new therapist."
      />

      <TherapistForm
        mode="create"
        branches={branches}
      />
    </DashboardLayout>
  );
}