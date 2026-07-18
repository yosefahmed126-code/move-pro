import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getTherapists } from "@/features/therapists/actions/getTherapists";
import TherapistsTable from "@/features/therapists/components/TherapistsTable";

export default async function TherapistsPage() {
  const therapists = await getTherapists();

  return (
    <DashboardLayout>
      <PageHeader
        title="Therapists"
        description="Manage clinic therapists."
      >
        <Link
          href="/therapists/new"
          className="flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-3 text-white hover:bg-cyan-700"
        >
          <Plus size={18} />
          Add Therapist
        </Link>
      </PageHeader>

      <TherapistsTable therapists={therapists} />
    </DashboardLayout>
  );
}