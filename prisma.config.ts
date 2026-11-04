import 'dotenv/config';
import { config } from 'dotenv';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Muat .env.local (konvensi Next.js) agar Prisma CLI dapat DATABASE_URL/DIRECT_URL.
config({ path: path.resolve(__dirname, '.env.local') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'] ?? '',
  },
});
