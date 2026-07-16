import DashboardLayout from "@/components/layout/DashboardLayout";
import BranchForm from "@/features/branches/components/BranchForm";

export default function NewBranchPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Add Branch
          </h1>

          <p className="mt-2 text-slate-500">
            Create a new clinic branch.
          </p>
        </div>

        <BranchForm />
      </div>
    </DashboardLayout>
  );
}