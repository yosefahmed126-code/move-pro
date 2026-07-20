export function ScheduleHeader() {
  return (
    <div className="flex items-center justify-between rounded-xl border bg-white p-4">
      <div>
        <h1 className="text-2xl font-bold">
          Schedule
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage appointments and therapists schedule.
        </p>
      </div>

      <div className="flex gap-2">
        <button className="rounded-lg border px-4 py-2">
          Today
        </button>

        <button className="rounded-lg bg-primary px-4 py-2 text-white">
          New Appointment
        </button>
      </div>
    </div>
  );
}