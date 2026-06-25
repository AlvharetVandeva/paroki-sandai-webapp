# Phase 1: Project Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyiapkan infrastruktur proyek Next.js 16, menginstal library (Prisma, Zod, Flowbite, shadcn/ui prerequisites), mengonfigurasi struktur folder, dan inisialisasi database Supabase PostgreSQL.

**Architecture:** Setup awal Next.js App Router dengan integrasi Prisma ORM, konfigurasi Tailwind CSS v4 untuk Flowbite & shadcn prerequisites, dan setup root layout. Phase 1 tidak membuat fitur bisnis penuh; fokusnya membuat fondasi yang bisa diverifikasi dengan lint/build.

**Tech Stack:** Next.js 16.2.9, React 19, Prisma, Zod, Supabase SDK, Tailwind CSS v4, Flowbite React, shadcn/ui prerequisites, lucide-react.

## Global Constraints

- Wajib menggunakan TypeScript strict mode.
- Komponen Next.js secara default adalah Server Components (tambahkan `"use client"` hanya jika diperlukan).
- Ikuti instruksi Next.js 16 breaking changes dari `AGENTS.md`.
- Semua folder baru dibuat di bawah root directory (setara dengan `app/`).
- Jangan memasukkan kredensial Supabase asli ke repository; gunakan `.env.example` untuk placeholder publik.

---

### Task 1: Konfigurasi Struktur Folder Dasar & Metadata Awal

**Files:**
- Create: `actions/.gitkeep`
- Create: `components/ui/.gitkeep`
- Create: `components/public/.gitkeep`
- Create: `components/forms/.gitkeep`
- Create: `lib/utils.ts`
- Create: `schemas/.gitkeep`
- Create: `services/.gitkeep`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` from `lib/utils.ts`.
- Produces: Indonesian root metadata for Paroki Sandai.

- [ ] **Step 1: Install utility dependencies**

Run:

```bash
npm install clsx tailwind-merge
```

Expected: `package.json` and `package-lock.json` include `clsx` and `tailwind-merge`.

- [ ] **Step 2: Create structure directories and keep files**

Run:

```bash
mkdir -p actions components/ui components/public components/forms lib schemas services
touch actions/.gitkeep components/ui/.gitkeep components/public/.gitkeep components/forms/.gitkeep schemas/.gitkeep services/.gitkeep
```

Expected: directories exist and are trackable by git.

- [ ] **Step 3: Create `lib/utils.ts`**

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Update `app/layout.tsx` metadata and language**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paroki Sandai",
  description: "Website resmi dan kalender pelayanan Paroki Sandai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Replace default `app/page.tsx`**

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <h1 className="text-center text-4xl font-bold">Website Paroki Sandai</h1>
    </main>
  );
}
```

- [ ] **Step 6: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands succeed.

- [ ] **Step 7: Commit**

```bash
git add actions components lib schemas services app/layout.tsx app/page.tsx package.json package-lock.json
git commit -m "chore: setup folder structure and base layout"
```

---

### Task 2: Inisialisasi Prisma & Supabase

**Files:**
- Create: `prisma/schema.prisma`
- Create: `.env.example`
- Create: `lib/prisma.ts`
- Create: `lib/supabase.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `lib/` folder from Task 1.
- Produces: default Prisma client export from `lib/prisma.ts`.
- Produces: `supabase` named export from `lib/supabase.ts`.

- [ ] **Step 1: Install Prisma, Zod & Supabase SDK**

Run:

```bash
npm install @prisma/client @supabase/supabase-js zod
npm install prisma --save-dev
```

Expected: dependencies are recorded in `package.json` and `package-lock.json`.

- [ ] **Step 2: Initialize Prisma if needed**

Run:

```bash
npx prisma init --datasource-provider postgresql
```

Expected: `prisma/schema.prisma` exists. If Prisma says it already exists, continue to Step 3.

- [ ] **Step 3: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model ServiceRole {
  id          Int                  @id @default(autoincrement())
  name        String               @unique
  description String?
  persons     Person[]
  assignments ScheduleAssignment[]
}

model Person {
  id          Int                  @id @default(autoincrement())
  fullName    String
  email       String?              @unique
  roleId      Int?
  role        ServiceRole?         @relation(fields: [roleId], references: [id])
  assignments ScheduleAssignment[]
}

model Schedule {
  id          Int                  @id @default(autoincrement())
  title       String
  startAt     DateTime
  endAt       DateTime
  location    String               @default("Gereja Paroki")
  description String?
  assignments ScheduleAssignment[]
}

model ScheduleAssignment {
  id         Int         @id @default(autoincrement())
  scheduleId Int
  personId   Int?
  roleId     Int
  schedule   Schedule    @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
  person     Person?     @relation(fields: [personId], references: [id], onDelete: SetNull)
  role       ServiceRole @relation(fields: [roleId], references: [id])
}

model Event {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  date        DateTime
  imageUrl    String?
}

model Announcement {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  createdAt DateTime @default(now())
}

model SiteSetting {
  key   String @id
  value String
}
```

- [ ] **Step 4: Create `.env.example` with safe placeholders**

```env
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR_ANON_KEY]"
```

- [ ] **Step 5: Create `lib/prisma.ts`**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

- [ ] **Step 6: Create `lib/supabase.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 7: Format Prisma schema and verify build**

Run:

```bash
npx prisma format
npm run lint
npm run build
```

Expected: all commands succeed. Do not run migrations in Phase 1 because credentials are not available yet.

- [ ] **Step 8: Commit**

```bash
git add prisma .env.example lib/prisma.ts lib/supabase.ts package.json package-lock.json
git commit -m "chore: setup prisma and supabase foundation"
```

---

### Task 3: Setup UI Framework Foundation (Flowbite & Icons)

**Files:**
- Modify: `app/globals.css`
- Modify: `app/page.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: base home page from Task 1.
- Produces: installed `flowbite`, `flowbite-react`, and `lucide-react` packages.

- [ ] **Step 1: Install Flowbite React and icons**

Run:

```bash
npm install flowbite flowbite-react lucide-react
```

Expected: dependencies are recorded in `package.json` and `package-lock.json`.

- [ ] **Step 2: Preserve Tailwind v4 global style foundation**

Keep `app/globals.css` compatible with Tailwind v4 using `@import "tailwindcss";`. Ensure the file contains this structure:

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

- [ ] **Step 3: Add a minimal Flowbite smoke component to `app/page.tsx`**

```tsx
import { Button } from "flowbite-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-center text-4xl font-bold">Website Paroki Sandai</h1>
      <Button color="blue">Flowbite Ready</Button>
    </main>
  );
}
```

- [ ] **Step 4: Verify**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands succeed.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/page.tsx package.json package-lock.json
git commit -m "chore: install flowbite and icon foundation"
```
