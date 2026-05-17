import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || databaseUrl.trim() === '') {
  throw new Error('Missing required environment variable: DATABASE_URL');
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const RESIDENTS_TO_CHECK = [
  { firstName: 'صالح', lastName: 'العبدالله' },
  { firstName: 'نورة', lastName: 'السالم' },
  { firstName: 'إبراهيم', lastName: 'المرزوق' },
  { firstName: 'لطيفة', lastName: 'الخالدي' },
];

async function verifyResidents() {
  console.log('🔍 Verifying residents...\n');
  
  const results = [];
  
  for (const resident of RESIDENTS_TO_CHECK) {
    const found = await prisma.resident.findFirst({
      where: {
        firstName: resident.firstName,
        lastName: resident.lastName,
      }
    });
    
    if (found) {
      results.push({
        fullName: `${found.firstName} ${found.lastName}`,
        found: true,
        id: found.id,
      });
      console.log(`✅ FOUND: ${found.firstName} ${found.lastName}`);
    } else {
      results.push({
        fullName: `${resident.firstName} ${resident.lastName}`,
        found: false,
      });
      console.log(`❌ NOT FOUND: ${resident.firstName} ${resident.lastName}`);
    }
  }
  
  const matchCount = results.filter(r => r.found).length;
  console.log(`\n📊 Summary: ${matchCount}/${results.length} residents found`);
  console.log('\nMatching Residents:');
  results.filter(r => r.found).forEach(r => {
    console.log(`  - ${r.fullName}`);
  });
  
  if (matchCount < results.length) {
    console.log('\nMissing Residents:');
    results.filter(r => !r.found).forEach(r => {
      console.log(`  - ${r.fullName}`);
    });
  }
}

verifyResidents()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
