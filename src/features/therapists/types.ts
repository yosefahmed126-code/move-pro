export interface Therapist {
  id: number;

  name: string;

  mobile: string | null;

  email: string | null;

  specialty: string | null;

  notes: string | null;

  branchId: number;

  status: string;

  createdAt: Date;

  updatedAt: Date;
}