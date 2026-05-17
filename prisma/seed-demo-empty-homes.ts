/**
 * One-time: add starter demo library to any care home that has zero residents.
 * Run: npx tsx prisma/seed-demo-empty-homes.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { seedDemoLibraryForCareHome } from "../server/src/lib/demoResidents.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const homes = await prisma.careHome.findMany({
    include: { users: { take: 1 } },
  });

  let seeded = 0;
  for (const home of homes) {
    const count = await prisma.resident.count({ where: { careHomeId: home.id } });
    if (count > 0) continue;

    const userId = home.users[0]?.id;
    if (!userId) {
      console.log(`Skip ${home.name}: no user`);
      continue;
    }

    const n = await seedDemoLibraryForCareHome(prisma, home.id, userId);
    if (n > 0) {
      console.log(`✅ ${home.name}: added ${n} demo residents`);
      seeded += 1;
    }
  }

  console.log(`\nDone. Seeded ${seeded} empty care home(s).`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
