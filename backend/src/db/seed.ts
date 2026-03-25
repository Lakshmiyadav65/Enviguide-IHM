import bcrypt from 'bcryptjs';
import { query, closePool } from '../config/database.js';

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

  // Seed user accounts only - no dummy vessels
  for (const u of users) {
    const result = await query(
      `INSERT INTO users (email, name, password, category, status, country)
       VALUES ($1, $2, $3, $4, 'active', $5)
       ON CONFLICT (email) DO UPDATE SET password = $3, updated_at = NOW()
       RETURNING email, category`,
      [u.email, u.name, hashedPassword, u.category, u.country],
    );
    console.log(`Seeded user: ${result.rows[0].email} (${result.rows[0].category})`);
  }

  console.log('\nDone! Only user accounts created. Vessels will be added by users through the platform.');
  await closePool();
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
