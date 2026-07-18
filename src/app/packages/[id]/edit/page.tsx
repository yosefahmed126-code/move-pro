import { notFound } from "next/navigation";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { prisma } from "@/lib/prisma";
import PackageForm from "@/features/packages/components/PackageForm";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPackagePage({
  params,
}: Props) {
  const { id } = await params;

  const packageData = await prisma.package.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!packageData) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            Edit Package
          </h1>

          <p className="text-slate-500">
            Update package information.
          </p>
        </div>

        <PackageForm
          packageData={{
            id: packageData.id,
            name: packageData.name,
            sessions: packageData.sessions,
            price: packageData.price,
            allowedExcuses: packageData.allowedExcuses,
            status: packageData.status,
          }}
        />
      </div>
    </DashboardLayout>
  );
}