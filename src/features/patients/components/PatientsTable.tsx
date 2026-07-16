"use client";

import type { Patient } from "../types";
import PatientStatusBadge from "./PatientStatusBadge";
import PatientActions from "./PatientActions";

interface Props {
  patients: Patient[];
}

export default function PatientsTable({ patients }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-100">
          <tr className="text-left text-sm font-semibold text-slate-600">
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Patient Name</th>
            <th className="px-4 py-3">Mobile</th>
            <th className="px-4 py-3">Therapist</th>
            <th className="px-4 py-3">Package</th>
            <th className="px-4 py-3 text-center">Remaining</th>
            <th className="px-4 py-3">Branch</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {patients.map((patient) => (
            <tr
              key={patient.id}
              className="border-t hover:bg-slate-50 transition-colors"
            >
              <td className="px-4 py-3 font-medium">{patient.code}</td>
              <td className="px-4 py-3">{patient.name}</td>
              <td className="px-4 py-3">{patient.mobile}</td>
              <td className="px-4 py-3">{patient.therapist}</td>
              <td className="px-4 py-3">{patient.package}</td>
              <td className="px-4 py-3 text-center">{patient.remaining}</td>
              <td className="px-4 py-3">{patient.branch}</td>
              <td className="px-4 py-3 text-center">
                <PatientStatusBadge status={patient.status} />
              </td>
              <td className="px-4 py-3">
                <PatientActions
  patientId={patient.id}
  patientName={patient.name}
/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}