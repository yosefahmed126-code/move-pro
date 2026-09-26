import { PatientStatus } from "@prisma/client";

interface Props {
  status: PatientStatus;
}

export default function PatientStatusBadge({
  status,
}: Props) {
  const isActive =
    status === PatientStatus.ACTIVE;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isActive
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}