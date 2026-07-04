import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load env files — .env.local takes precedence (Next.js convention)
config();
config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
