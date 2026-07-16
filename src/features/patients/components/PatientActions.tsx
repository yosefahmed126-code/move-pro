"use client";

import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import DeletePatientDialog from "./DeletePatientDialog";

interface Props {
  patientId: number;
  patientName: string;
}

export default function PatientActions({
  patientId,
  patientName,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Link
        href={`/patients/${patientId}`}
        title="View"
        className="rounded-md p-2 text-cyan-600 transition hover:bg-cyan-50"
      >
        <Eye size={18} />
      </Link>

      <Link
        href={`/patients/${patientId}/edit`}
        title="Edit"
        className="rounded-md p-2 text-orange-500 transition hover:bg-orange-50"
      >
        <Pencil size={18} />
      </Link>

      <DeletePatientDialog
        patientId={patientId}
        patientName={patientName}
      />
    </div>
  );
}