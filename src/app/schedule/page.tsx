import DashboardLayout from "@/components/layout/DashboardLayout";
import { prisma } from "@/lib/prisma";

import { ScheduleHeader } from "@/features/schedule/components/ScheduleHeader";
import { ScheduleGrid } from "@/features/schedule/components/ScheduleGrid";
import { getSchedule } from "@/features/appointments/actions/getSchedule";

export default async function SchedulePage() {
  const today = new Date();

  const therapists = await prisma.therapist.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const appointments = await getSchedule(today);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ScheduleHeader />

        <ScheduleGrid
          therapists={therapists}
          appointments={appointments}
        />
      </div>
    </DashboardLayout>
  );
}