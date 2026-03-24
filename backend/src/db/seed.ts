import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

async function seed() {
  const hashedPassword = await bcrypt.hash('demo123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'admin@maritime.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@maritime.com',
      name: 'Admin User',
      password: hashedPassword,
      category: 'admin',
      status: 'active',
      country: 'Global',
    },
  });

  console.log(`Seeded user: ${user.email} (${user.id})`);
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
