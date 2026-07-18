"use client";

import StatusBadge from "@/components/table/StatusBadge";
import TherapistActions from "./TherapistActions";
import { TherapistTableItem } from "../types";

interface Props {
  therapists: TherapistTableItem[];
}

export default function TherapistsTable({
  therapists,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Specialty</th>
            <th className="p-4 text-left">Branch</th>
            <th className="p-4 text-center">Patients</th>
            <th className="p-4 text-center">Appointments</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
  {therapists.length === 0 ? (
    <tr>
      <td
        colSpan={7}
        className="p-8 text-center text-slate-500"
      >
        No therapists found.
      </td>
    </tr>
  ) : (
    therapists.map((therapist) => (
      <tr
        key={therapist.id}
        className="border-t"
      >
        <td className="p-4 font-medium">
          {therapist.name}
        </td>

        <td className="p-4">
          {therapist.specialty || "-"}
        </td>

        <td className="p-4">
          {therapist.branch.name}
        </td>

        <td className="p-4 text-center">
          {therapist.patientsCount}
        </td>

        <td className="p-4 text-center">
          {therapist.appointmentsCount}
        </td>

        <td className="p-4 text-center">
          <StatusBadge status={therapist.status} />
        </td>

        <td className="p-4 text-center">
          <TherapistActions therapistId={therapist.id} />
        </td>
      </tr>
    ))
  )}
</tbody>
      </table>
    </div>
  );
}