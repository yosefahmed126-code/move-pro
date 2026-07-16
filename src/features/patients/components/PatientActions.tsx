"use client";

import Link from "next/link";
import { Eye, Pencil } from "lucide-react";

interface Props {
  patientId: number;
}

export default function PatientActions({ patientId }: Props) {
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
    </div>
  );
}