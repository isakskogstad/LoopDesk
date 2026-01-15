import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL required");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const users = [
  {
    name: "Andreas Jennische",
    email: "andreas@loop.se",
    role: "Nyhetschef och redaktör",
    phone: "073 392 22 28",
    image: "/avatars/andreas-jennische.png",
  },
  {
    name: "Johann Bernövall",
    email: "johann@loop.se",
    role: "Reporter och redaktör",
    phone: "073 752 12 48",
    image: "/avatars/johann-bernovall.png",
  },
  {
    name: "Jenny Kjellén",
    email: "jenny@loop.se",
    role: "Reporter",
    phone: null,
    image: "/avatars/jenny-kjellen.png",
  },
  {
    name: "Camilla Bergman",
    email: "camilla@loop.se",
    role: "Chefredaktör och vd",
    phone: null,
    image: "/avatars/camilla-bergman.png",
  },
  {
    name: "Diana Demin",
    email: "diana@loop.se",
    role: "CMO och Head of Expansion",
    phone: null,
    image: "/avatars/diana-demin.png",
  },
  {
    name: "Sandra Norberg",
    email: "sandra@loop.se",
    role: "Kommersiell chef",
    phone: "070 458 08 58",
    image: "/avatars/sandra-norberg.png",
  },
  {
    name: "Christian von Essen",
    email: "christian@loop.se",
    role: "Kommersiell redaktör",
    phone: null,
    image: "/avatars/christian-von-essen.png",
  },
  {
    name: "Isak Skogstad",
    email: "isak.skogstad@me.com",
    role: "Utvecklare",
    phone: null,
    image: "/avatars/isak-skogstad.png",
  },
];

// Default password for all users - they should change it after first login
const DEFAULT_PASSWORD = "LoopDesk2024!";

async function main() {
  console.log("Creating user accounts...\n");

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const user of users) {
    try {
      const existing = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existing) {
        // Update existing user with password if they don't have one
        if (!existing.passwordHash) {
          await prisma.user.update({
            where: { email: user.email },
            data: {
              passwordHash,
              name: user.name,
              image: user.image,
              phone: user.phone,
            },
          });
          console.log(`Updated: ${user.name} (${user.email}) - password set`);
        } else {
          console.log(`Skipped: ${user.name} (${user.email}) - already has password`);
        }
      } else {
        // Create new user
        await prisma.user.create({
          data: {
            name: user.name,
            email: user.email,
            image: user.image,
            phone: user.phone,
            passwordHash,
            role: "user",
          },
        });
        console.log(`Created: ${user.name} (${user.email})`);
      }
    } catch (error) {
      console.error(`Error with ${user.email}:`, error);
    }
  }

  console.log("\n--- Done ---");
  console.log(`Default password for all users: ${DEFAULT_PASSWORD}`);
  console.log("Users should change their password after first login.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
