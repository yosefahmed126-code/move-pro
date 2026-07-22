import DashboardLayout from "@/components/layout/DashboardLayout";

import { ScheduleHeader } from "@/features/schedule/components/ScheduleHeader";
import { ScheduleGrid } from "@/features/schedule/components/ScheduleGrid";
import { getSchedule } from "@/features/schedule/actions/getSchedule";

export default async function SchedulePage() {
  const {
    therapists,
    appointments,
    patients,
  } = await getSchedule();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ScheduleHeader />

        <ScheduleGrid
          therapists={therapists}
          appointments={appointments}
          patients={patients}
        />
      </div>
    </DashboardLayout>
  );
}