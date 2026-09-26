"use client";

import { PatientStatus } from "@prisma/client";

import PatientStatusBadge from "./PatientStatusBadge";
import PatientActions from "./PatientActions";

interface PatientTableItem {
  id: number;
  code: string;
  name: string;
  mobile: string;
  status: PatientStatus;
  packageName: string;
  remainingSessions: number;
  totalSessions: number;
  branchName: string;
}

interface Props {
  patients: PatientTableItem[];
}

export default function PatientsTable({
  patients,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-100">
          <tr className="text-left text-sm font-semibold text-slate-600">
            <th className="px-4 py-3">
              Code
            </th>

            <th className="px-4 py-3">
              Patient Name
            </th>

            <th className="px-4 py-3">
              Mobile
            </th>

            <th className="px-4 py-3">
              Package
            </th>

            <th className="px-4 py-3 text-center">
              Remaining
            </th>

            <th className="px-4 py-3">
              Branch
            </th>

            <th className="px-4 py-3 text-center">
              Status
            </th>

            <th className="px-4 py-3 text-center">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {patients.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-10 text-center text-slate-500"
              >
                No patients found.
              </td>
            </tr>
          ) : (
            patients.map((patient) => (
              <tr
                key={patient.id}
                className="border-t transition-colors hover:bg-slate-50"
              >
                <td className="px-4 py-3 font-medium">
                  {patient.code}
                </td>

                <td className="px-4 py-3">
                  {patient.name}
                </td>

                <td className="px-4 py-3">
                  {patient.mobile}
                </td>

                <td className="px-4 py-3">
                  {patient.packageName}
                </td>

                <td className="px-4 py-3 text-center">
                  {patient.remainingSessions}
                  {" / "}
                  {patient.totalSessions}
                </td>

                <td className="px-4 py-3">
                  {patient.branchName}
                </td>

                <td className="px-4 py-3 text-center">
                  <PatientStatusBadge
                    status={patient.status}
                  />
                </td>

                <td className="px-4 py-3 text-center">
                  <PatientActions
                    patientId={patient.id}
                    patientName={patient.name}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}