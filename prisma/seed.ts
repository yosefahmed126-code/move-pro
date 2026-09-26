import { PrismaClient, UserRole, PackageStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ===========================
  // Password
  // ===========================
  const passwordHash = await bcrypt.hash("123456", 10);

  // ===========================
  // Main Branch
  // ===========================
  const branch = await prisma.branch.upsert({
    where: {
      code: "MAIN",
    },
    update: {},
    create: {
      code: "MAIN",
      name: "Main Branch",
      isMain: true,
    },
  });

  // ===========================
  // Super Admin
  // ===========================
  await prisma.user.upsert({
    where: {
      username: "admin",
    },
    update: {},
    create: {
      fullName: "System Administrator",
      username: "admin",
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      branchId: branch.id,
    },
  });

  // ===========================
  // Therapists
  // ===========================

  const therapists = [
    {
      code: "TH-001",
      name: "M. Maher",
    },
    {
      code: "TH-002",
      name: "Mostafa",
    },
    {
      code: "TH-003",
      name: "Yassmin",
    },
  ];

  for (const therapist of therapists) {
    await prisma.therapist.upsert({
      where: {
        code: therapist.code,
      },
      update: {},
      create: {
        code: therapist.code,
        name: therapist.name,
        branchId: branch.id,
      },
    });
  }

  // ===========================
  // Packages
  // ===========================

  const packages = [
    {
      name: "1 Session",
      sessions: 1,
      price: 200,
      allowedExcuses: 0,
    },
    {
      name: "4 Sessions",
      sessions: 4,
      price: 600,
      allowedExcuses: 1,
    },
    {
      name: "6 Sessions",
      sessions: 6,
      price: 850,
      allowedExcuses: 2,
    },
    {
      name: "8 Sessions",
      sessions: 8,
      price: 1100,
      allowedExcuses: 3,
    },
    {
      name: "12 Sessions",
      sessions: 12,
      price: 1500,
      allowedExcuses: 4,
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: {
        name: pkg.name,
      },
      update: {},
      create: {
        ...pkg,
        status: PackageStatus.ACTIVE,
      },
    });
  }

  console.log("✅ Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });