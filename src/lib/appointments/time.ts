export function calculateEndTime(
  startTime: Date,
  duration: number
): Date {
  const endTime = new Date(startTime);

  endTime.setMinutes(
    endTime.getMinutes() + duration
  );

  return endTime;
}