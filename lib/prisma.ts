import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Force Next.js Turbopack cache invalidation for History CMS

// Konfigurasi adapter MariaDB dari environment variables (.env.local)
// Di serverless environment (Vercel), batasi connection per instance
// agar tidak melebihi total limit database di cPanel.
const connectionLimit = process.env.DB_CONNECTION_LIMIT
  ? Number(process.env.DB_CONNECTION_LIMIT)
  : (process.env.NODE_ENV === "production" ? 1 : 10);

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: connectionLimit,
  connectTimeout: 15000, // Tingkatkan waktu tunggu pembuatan socket (15 detik) menghindari lag cPanel
});

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
