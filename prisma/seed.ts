import { PrismaClient, AppointmentStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Role
  const adminRole = await prisma.role.upsert({
    where: { name: "Administrator" },
    update: {},
    create: {
      name: "Administrator",
      description: "System Administrator",
    },
  });

  // Branch
  const branch = await prisma.branch.upsert({
    where: { name: "Main Branch" },
    update: {},
    create: {
      name: "Main Branch",
    },
  });

  // User
  const password = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: {
      username: "admin",
    },
    update: {},
    create: {
      fullName: "System Administrator",
      username: "admin",
      password,
      roleId: adminRole.id,
      branchId: branch.id,
    },
  });

  // Therapists
  const therapist1 = await prisma.therapist.create({
    data: {
      name: "M.Maher",
      branchId: branch.id,
    },
  });

  const therapist2 = await prisma.therapist.create({
    data: {
      name: "Mostafa",
      branchId: branch.id,
    },
  });

  const therapist3 = await prisma.therapist.create({
    data: {
      name: "Yassmin",
      branchId: branch.id,
    },
  });

  // Packages
  const package4 = await prisma.package.create({
    data: {
      name: "4 Sessions",
      sessions: 4,
      price: 600,
      allowedExcuses: 1,
    },
  });

  const package8 = await prisma.package.create({
    data: {
      name: "8 Sessions",
      sessions: 8,
      price: 1100,
      allowedExcuses: 3,
    },
  });

  await prisma.package.create({
    data: {
      name: "12 Sessions",
      sessions: 12,
      price: 1500,
      allowedExcuses: 4,
    },
  });

  // Patient
  const patient = await prisma.patient.create({
    data: {
      code: "MP-000001",
      name: "Ahmed Ali",
      mobile: "01000000000",

      therapistId: therapist1.id,
      branchId: branch.id,

      packageId: package8.id,
      remaining: 8,
    },
  });

  // Appointment
  const date = new Date();

  const startTime = new Date(date);
  startTime.setHours(9, 0, 0, 0);

  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + 40);

  await prisma.appointment.create({
    data: {
      code: "AP-000001",

      patientId: patient.id,
      therapistId: therapist1.id,
      branchId: branch.id,
      createdById: admin.id,

      date,

      startTime,
      endTime,

      duration: 40,
      status: AppointmentStatus.BOOKED,
    },
  });

  console.log("🌱 Seed completed successfully.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });