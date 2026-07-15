import { Patient } from "../types";

export const patients: Patient[] = [
  {
    id: 1,
    code: "MP-0001",
    name: "يوسف أحمد",
    mobile: "01012345678",
    therapist: "د. أحمد فاروق",
    package: "12 Sessions",
    remaining: 8,
    branch: "New Cairo",
    status: "Active",
  },
  {
    id: 2,
    code: "MP-0002",
    name: "محمد خالد",
    mobile: "01198765432",
    therapist: "د. منى علي",
    package: "8 Sessions",
    remaining: 3,
    branch: "Nasr City",
    status: "Active",
  },
];