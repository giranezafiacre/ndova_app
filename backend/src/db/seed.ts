import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import { sequelize } from "../config/database";

// Import models through the index so all associations are wired before use.
import { User, Role, UserRole, Service } from "../models";

const SALT_ROUNDS = 10;

async function seed() {
  await sequelize.authenticate();
  console.log("Database connected. Seeding...\n");

  // -------------------------------------------------------------------------
  // Roles
  // -------------------------------------------------------------------------
  const roleNames = ["ADMIN", "PROVIDER", "CLIENT"] as const;
  const roles: Record<string, Role> = {};

  for (const name of roleNames) {
    const [role] = await Role.findOrCreate({ where: { name } });
    roles[name] = role;
    console.log(`  Role: ${name}`);
  }

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------
  const userData = [
    {
      firstName: "System",
      lastName: "Admin",
      email: "admin@ndova.com",
      password: "Admin@123",
      phone: "+1 000 000 0001",
      role: "ADMIN" as const,
    },
    {
      firstName: "Jane",
      lastName: "Provider",
      email: "provider@ndova.com",
      password: "Provider@123",
      phone: "+1 000 000 0002",
      role: "PROVIDER" as const,
    },
    {
      firstName: "John",
      lastName: "Client",
      email: "client@ndova.com",
      password: "Client@123",
      phone: "+1 000 000 0003",
      role: "CLIENT" as const,
    },
  ];

  for (const u of userData) {
    const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);

    let user = await User.findOne({ where: { email: u.email } });
    if (!user) {
      user = await User.create({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        passwordHash,
        phone: u.phone,
      });
    }

    await UserRole.findOrCreate({
      where: { userId: user.id, roleId: roles[u.role].id },
    });
    console.log(`  User: ${u.email}  (${u.role})  password: ${u.password}`);
  }

  // -------------------------------------------------------------------------
  // Services
  // -------------------------------------------------------------------------
  const services = [
    {
      name: "Medical Consultation",
      description:
        "Professional medical consultations and healthcare guidance.",
    },
    {
      name: "Legal Advisory",
      description:
        "Legal guidance, document review, and professional advisory services.",
    },
    {
      name: "Accounting & Tax",
      description:
        "Accounting, bookkeeping, tax preparation, and compliance services.",
    },
    {
      name: "Architecture & Design",
      description:
        "Architectural planning, design, and project consultation services.",
    },
    {
      name: "Civil Engineering",
      description:
        "Civil engineering consultation, planning, and project support.",
    },
    {
      name: "Software Development",
      description:
        "Custom software, web, mobile, and technical development services.",
    },
    {
      name: "Education & Tutoring",
      description:
        "Academic tutoring, training, and educational support services.",
    },
    {
      name: "Dental Care",
      description:
        "Professional dental consultation, treatment, and preventive care.",
    },
    {
      name: "Physiotherapy",
      description:
        "Physical rehabilitation, mobility, and pain-management services.",
    },
    {
      name: "Real Estate",
      description:
        "Property sales, rentals, valuation, and real-estate advisory services.",
    },
    {
      name: "Financial Planning",
      description:
        "Personal and business financial planning and advisory services.",
    },
    {
      name: "Electrical Works",
      description: "Electrical installation, repair, and maintenance services.",
    },
    {
      name: "Plumbing & Sanitation",
      description: "Plumbing installation, repair, and sanitation services.",
    },
    {
      name: "Hair & Beauty",
      description: "Hair styling, grooming, skincare, and beauty services.",
    },
    {
      name: "Photography & Events",
      description: "Photography, videography, and event support services.",
    },
    {
      name: "Cleaning Services",
      description:
        "Residential, commercial, and specialized cleaning services.",
    },
  ];

  for (const s of services) {
    await Service.findOrCreate({ where: { name: s.name }, defaults: s });
    console.log(`  Service: ${s.name}`);
  }

  console.log("\nSeed complete.");
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => sequelize.close());
