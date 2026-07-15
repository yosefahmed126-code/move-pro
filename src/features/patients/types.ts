export interface Patient {
  id: number;
  code: string;
  name: string;
  gender?: string | null;
  birthDate?: Date | null;
  mobile: string;
  mobile2?: string | null;
  email?: string | null;
  nationalId?: string | null;
  address?: string | null;
  therapist?: string | null;
  package?: string | null;
  remaining: number;
  branch: string;
  status: string;
}