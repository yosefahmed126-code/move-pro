import DashboardLayout from "@/components/layout/DashboardLayout";
import BranchForm from "@/features/branches/components/BranchForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditBranchPage({
  params,
}: Props) {
  const { id } = await params;

  const branch = await prisma.branch.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!branch) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Edit Branch
          </h1>

          <p className="mt-2 text-slate-500">
            Update branch information.
          </p>
        </div>

        <BranchForm
          mode="edit"
          branch={branch}
        />
      </div>
    </DashboardLayout>
  );
}