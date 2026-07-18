import DashboardLayout from "@/components/layout/DashboardLayout";
import PackageForm from "@/features/packages/components/PackageForm";

export default function NewPackagePage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            Add Package
          </h1>

          <p className="text-slate-500">
            Create a new treatment package.
          </p>
        </div>

        <PackageForm />
      </div>
    </DashboardLayout>
  );
}