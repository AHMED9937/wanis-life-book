/**
 * One-time fix: split users who share the same care home into private homes.
 * Reassign residents to the care home of whoever first recorded a story for them.
 *
 * Run: npx tsx prisma/migrate-tenants.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SHARED_HOME_NAMES = ["Unassigned", "Wanis Demo"];

async function main() {
  console.log("🔧 Starting tenant isolation migration...\n");

  const sharedHomes = await prisma.careHome.findMany({
    where: { name: { in: SHARED_HOME_NAMES } },
  });

  if (sharedHomes.length === 0) {
    console.log("No shared care homes found. Nothing to migrate.");
    return;
  }

  const sharedHomeIds = sharedHomes.map((h) => h.id);

  const usersToSplit = await prisma.user.findMany({
    where: { careHomeId: { in: sharedHomeIds } },
  });

  console.log(`Found ${usersToSplit.length} user(s) on shared care home(s).`);

  const demoHome =
    sharedHomes.find((h) => h.name === "Wanis Demo") ??
    (await prisma.careHome.create({
      data: {
        name: "Wanis Demo",
        contactNumber: "00000000",
        address: "Sample data for demo admin only",
      },
    }));

  const seedAdmin = await prisma.user.findFirst({
    where: { email: "admin@wanis.app" },
  });

  for (const user of usersToSplit) {
    if (seedAdmin && user.id === seedAdmin.id) {
      await prisma.user.update({
        where: { id: user.id },
        data: { careHomeId: demoHome.id },
      });
      console.log(`  ↳ Demo admin → Wanis Demo`);
      continue;
    }

    const homeName =
      user.fullName && user.fullName !== "Unknown User"
        ? `دار ${user.fullName}`
        : `دار ${user.email.split("@")[0]}`;

    const personalHome = await prisma.careHome.create({
      data: {
        name: homeName,
        contactNumber: "—",
        address: "—",
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { careHomeId: personalHome.id },
    });

    console.log(`  ↳ ${user.email} → new care home "${homeName}"`);
  }

  const residents = await prisma.resident.findMany({
    where: { careHomeId: { in: sharedHomeIds } },
    include: {
      lifeBook: {
        include: {
          stories: { orderBy: { createdAt: "asc" }, take: 1 },
        },
      },
    },
  });

  console.log(`\nReassigning ${residents.length} resident(s)...`);

  for (const resident of residents) {
    const firstStory = resident.lifeBook?.stories[0];
    if (firstStory) {
      const recorder = await prisma.user.findUnique({
        where: { id: firstStory.recordedById },
      });
      if (recorder && !sharedHomeIds.includes(recorder.careHomeId)) {
        await prisma.resident.update({
          where: { id: resident.id },
          data: { careHomeId: recorder.careHomeId },
        });
        console.log(`  ↳ Resident ${resident.firstName} → recorder's home`);
        continue;
      }
    }

    await prisma.resident.update({
      where: { id: resident.id },
      data: { careHomeId: demoHome.id },
    });
    console.log(`  ↳ Resident ${resident.firstName} → Wanis Demo (sample/orphan)`);
  }

  const oldUnassigned = sharedHomes.find((h) => h.name === "Unassigned");
  if (oldUnassigned) {
    const remaining = await prisma.user.count({
      where: { careHomeId: oldUnassigned.id },
    });
    const remainingResidents = await prisma.resident.count({
      where: { careHomeId: oldUnassigned.id },
    });
    if (remaining === 0 && remainingResidents === 0) {
      await prisma.careHome.delete({ where: { id: oldUnassigned.id } });
      console.log("\n🗑️ Removed empty 'Unassigned' care home.");
    }
  }

  console.log("\n✅ Tenant migration complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
