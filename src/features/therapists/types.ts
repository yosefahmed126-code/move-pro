export interface TherapistTableItem {
  id: number;
  name: string;
  specialty: string | null;
  status: string;

  branch: {
    name: string;
  };

  patientsCount: number;
  appointmentsCount: number;
}