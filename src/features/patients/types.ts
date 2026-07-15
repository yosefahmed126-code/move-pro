export interface Patient {
  id: number;
  code: string;
  name: string;
  mobile: string;
  therapist: string;
  package: string;
  remaining: number;
  branch: string;
  status: "Active" | "Inactive";
}