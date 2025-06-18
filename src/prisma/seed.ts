// prisma/seed.ts
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admins = [
    {
      username: "superadmin1",
      email: "superadmin1@example.com",
      name: "Super Admin One",
      role: Role.SUPERADMIN, // gunakan enum, bukan string
      password: await bcrypt.hash("password123", 10),
    },
    {
      username: "superadmin2",
      email: "superadmin2@example.com",
      name: "Super Admin Two",
      role: Role.SUPERADMIN,
      password: await bcrypt.hash("password123", 10),
    },
    {
      username: "admin1",
      email: "admin1@example.com",
      name: "Admin One",
      role: Role.ADMIN,
      password: await bcrypt.hash("password123", 10),
    },
    {
      username: "admin2",
      email: "admin2@example.com",
      name: "Admin Two",
      role: Role.ADMIN,
      password: await bcrypt.hash("password123", 10),
    },
  ];

  for (const admin of admins) {
    await prisma.admin.upsert({
      where: { username: admin.username },
      update: {},
      create: admin,
    });
  }

  console.log("✅ Admins seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding admins:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
