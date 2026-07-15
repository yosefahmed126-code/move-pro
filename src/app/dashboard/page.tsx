import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/features/dashboard/components/StatsCard";

import {
  Users,
  Clock3,
  Wallet,
  Stethoscope,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">

        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <div className="grid grid-cols-4 gap-5">

          <StatsCard
            title="Patients Today"
            value={42}
            icon={Users}
            color="bg-cyan-500"
          />

          <StatsCard
            title="Waiting"
            value={7}
            icon={Clock3}
            color="bg-orange-500"
          />

          <StatsCard
            title="Revenue"
            value="12,500 EGP"
            icon={Wallet}
            color="bg-green-500"
          />

          <StatsCard
            title="Therapists"
            value={9}
            icon={Stethoscope}
            color="bg-indigo-500"
          />

        </div>

      </div>
    </DashboardLayout>
  );
}