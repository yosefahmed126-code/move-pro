"use client";

import { Eye, Pencil } from "lucide-react";

interface Props {
  patientId: number;
}

export default function PatientActions({ patientId }: Props) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        title="View"
        className="rounded-md p-2 text-cyan-600 hover:bg-cyan-50"
        onClick={() => console.log("View", patientId)}
      >
        <Eye size={18} />
      </button>

      <button
        title="Edit"
        className="rounded-md p-2 text-orange-500 hover:bg-orange-50"
        onClick={() => console.log("Edit", patientId)}
      >
        <Pencil size={18} />
      </button>
    </div>
  );
}