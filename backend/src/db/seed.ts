import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

const DEFAULT_PASSWORD = 'Envi123';

const users = [
  { email: 'narasimha.goggi@enviguide.com',       name: 'Narasimha Goggi',       category: 'admin',   country: 'India' },
  { email: 'hruday.murikipudi@enviguide.com',      name: 'Hruday Murikipudi',     category: 'admin',   country: 'India' },
  { email: 'saisanjan.kethamreddy@enviguide.com',   name: 'Sai Sanjan Kethamreddy', category: 'admin',   country: 'India' },
  { email: 'vishnu.simhadri@enviguide.com',         name: 'Vishnu Simhadri',       category: 'admin',   country: 'India' },
  { email: 'govardhan.kothapalli@enviguide.com',    name: 'Govardhan Kothapalli',  category: 'admin',   country: 'India' },
  { email: 'sivaprasad@enviguide.com',              name: 'Sivaprasad',            category: 'admin',   country: 'India' },
];

async function seed() {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  // Seed user accounts only — no dummy vessels
  // Vessels are created by users through the platform after they log in
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashedPassword },
      create: {
        email: u.email,
        name: u.name,
        password: hashedPassword,
        category: u.category,
        status: 'active',
        country: u.country,
      },
    });
    console.log(`Seeded user: ${user.email} (${user.category})`);
  }

  // Clean up any dummy vessels that were previously seeded
  const deleted = await prisma.vessel.deleteMany();
  if (deleted.count > 0) {
    console.log(`Removed ${deleted.count} dummy vessel(s)`);
  }

  console.log('\nDone! Only user accounts created. Vessels will be added by users through the platform.');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
