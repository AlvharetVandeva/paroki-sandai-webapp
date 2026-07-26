# Revisi Profil Paroki — Bagan Organisasi & Wilayah Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace OrganizationMember CRUD with single image upload for org chart, add ParishCenter + Station models, and add Wilayah section to public page and CMS.

**Architecture:** Three server action files handle all mutations (org chart image, parish center, station CRUD). One service file provides read queries. Two new public components render the org chart image and wilayah section. CMS dashboard gets a third tab for wilayah management.

**Tech Stack:** Next.js App Router, TypeScript, Prisma (MySQL), Zod, shadcn/ui, Tailwind CSS

## Global Constraints

- Bahasa Indonesia for user-facing text and documentation
- Server Components by default; Client Components only for interactive browser features
- Mutations via Server Actions in `actions/`
- Read-only queries via services in `services/`
- Validation via Zod schemas
- Prisma client singleton from `@/lib/prisma`
- Database: remote MySQL `parokis1_web` at `101.50.1.79`
- Migration via `prisma db push` (remote server, no dev migrations)
- Use existing `/api/upload` endpoint for image uploads (sharp WebP compression)

---

### Task 1: Update Prisma schema and push database changes

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Consumes: Nothing (first task)
- Produces:
  - Prisma models: `ParishCenter` (id, name, patron, updatedAt), `Station` (id, name, patron, address?, orderIndex, createdAt, updatedAt)
  - Removed: `OrganizationMember` model

- [ ] **Step 1: Remove `OrganizationMember` model and add `ParishCenter` + `Station` models**

In [prisma/schema.prisma](prisma/schema.prisma), remove lines 175-183 (the `OrganizationMember` model) and add the two new models at the end of the file:

```prisma
// ─── Profil Paroki ──────────────────────────────────────────────────────────

model ParishCenter {
  id        Int      @id @default(autoincrement())
  name      String                         // nama panjang paroki
  patron    String                         // nama pelindung
  updatedAt DateTime @updatedAt
}

model Station {
  id         Int      @id @default(autoincrement())
  name       String                        // nama stasi
  patron     String                        // nama pelindung stasi
  address    String?                       // alamat, nullable
  orderIndex Int      @default(0)          // urutan tampil
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

- [ ] **Step 2: Push schema changes to remote database**

```bash
npx prisma db push
```

Expected: schema synced, `OrganizationMember` dropped, `ParishCenter` and `Station` created.

- [ ] **Step 3: Regenerate Prisma client**

```bash
npx prisma generate
```

Expected: Prisma client regenerated with new models.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma lib/generated/prisma/
git commit -m "feat: replace OrganizationMember with ParishCenter and Station models"
```

---

### Task 2: Create Zod schemas and delete old schema

**Files:**
- Create: `schemas/station.schema.ts`
- Create: `schemas/parish-center.schema.ts`
- Delete: `schemas/organization.schema.ts`

**Interfaces:**
- Consumes: Prisma models `ParishCenter`, `Station` (from Task 1)
- Produces:
  - `StationSchema` — Zod object: `name`, `patron`, `address` (nullable), `orderIndex`
  - `StationUpdateSchema` — partial version of `StationSchema`
  - `StationInput` — inferred type from `StationSchema`
  - `StationUpdate` — inferred type from `StationUpdateSchema`
  - `ParishCenterSchema` — Zod object: `name`, `patron`
  - `ParishCenterInput` — inferred type from `ParishCenterSchema`

- [ ] **Step 1: Create `schemas/station.schema.ts`**

```ts
import { z } from "zod";

export const StationSchema = z.object({
  name: z
    .string()
    .min(2, "Nama stasi minimal 2 karakter")
    .max(100, "Nama stasi maksimal 100 karakter"),
  patron: z
    .string()
    .min(2, "Nama pelindung minimal 2 karakter")
    .max(100, "Nama pelindung maksimal 100 karakter"),
  address: z.string().nullable().optional(),
  orderIndex: z.number().int().min(0).default(0),
});

export const StationUpdateSchema = StationSchema.partial();

export type StationInput = z.infer<typeof StationSchema>;
export type StationUpdate = z.infer<typeof StationUpdateSchema>;
```

- [ ] **Step 2: Create `schemas/parish-center.schema.ts`**

```ts
import { z } from "zod";

export const ParishCenterSchema = z.object({
  name: z
    .string()
    .min(2, "Nama paroki minimal 2 karakter")
    .max(100, "Nama paroki maksimal 100 karakter"),
  patron: z
    .string()
    .min(2, "Nama pelindung minimal 2 karakter")
    .max(100, "Nama pelindung maksimal 100 karakter"),
});

export type ParishCenterInput = z.infer<typeof ParishCenterSchema>;
```

- [ ] **Step 3: Delete `schemas/organization.schema.ts`**

```bash
rm schemas/organization.schema.ts
```

- [ ] **Step 4: Commit**

```bash
git add schemas/station.schema.ts schemas/parish-center.schema.ts
git add -u schemas/organization.schema.ts
git commit -m "feat: add Station and ParishCenter Zod schemas, remove old org schema"
```

---

### Task 3: Update service layer

**Files:**
- Modify: `services/organization.service.ts`

**Interfaces:**
- Consumes: Prisma models `ParishCenter`, `Station` (from Task 1)
- Produces:
  - `getParishCenter()` → `Promise<ParishCenter | null>` — the singleton parish center record
  - `getStations()` → `Promise<Station[]>` — all stations ordered by `orderIndex` ascending
- Removed: `getAllMembers()` function

- [ ] **Step 1: Replace service functions in `services/organization.service.ts`**

Replace all content:

```ts
import prisma from "@/lib/prisma";

export async function getParishCenter() {
  return prisma.parishCenter.findFirst();
}

export async function getStations() {
  return prisma.station.findMany({
    orderBy: { orderIndex: "asc" },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add services/organization.service.ts
git commit -m "feat: replace getAllMembers with getParishCenter and getStations services"
```

---

### Task 4: Create and update server actions

**Files:**
- Create: `actions/station.action.ts`
- Create: `actions/parish-center.action.ts`
- Modify: `actions/organization.action.ts`

**Interfaces:**
- Consumes:
  - Zod schemas from Task 2
  - Prisma models from Task 1
- Produces:
  - `createStation(data)` → `{ success: boolean, error?: string }`
  - `updateStation(id, data)` → `{ success: boolean, error?: string }`
  - `deleteStation(id)` → `{ success: boolean, error?: string }`
  - `saveParishCenter(data)` → `{ success: boolean, error?: string }`
  - `saveOrganizationChart(url)` → `{ success: boolean, error?: string }`
- Removed: `createMember`, `updateMember`, `deleteMember`

- [ ] **Step 1: Create `actions/station.action.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  StationSchema,
  StationUpdateSchema,
} from "@/schemas/station.schema";

export async function createStation(data: Record<string, unknown>) {
  try {
    const parsed = StationSchema.parse(data);
    await prisma.station.create({ data: parsed });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menambah stasi" };
  }
}

export async function updateStation(id: number, data: Record<string, unknown>) {
  try {
    const parsed = StationUpdateSchema.parse(data);
    await prisma.station.update({
      where: { id },
      data: parsed,
    });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengubah stasi" };
  }
}

export async function deleteStation(id: number) {
  try {
    await prisma.station.delete({ where: { id } });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus stasi" };
  }
}
```

- [ ] **Step 2: Create `actions/parish-center.action.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { ParishCenterSchema } from "@/schemas/parish-center.schema";

export async function saveParishCenter(data: Record<string, unknown>) {
  try {
    const parsed = ParishCenterSchema.parse(data);
    const existing = await prisma.parishCenter.findFirst();
    if (existing) {
      await prisma.parishCenter.update({
        where: { id: existing.id },
        data: parsed,
      });
    } else {
      await prisma.parishCenter.create({ data: parsed });
    }
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan pusat paroki" };
  }
}
```

- [ ] **Step 3: Replace `actions/organization.action.ts`**

Replace all content:

```ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function saveOrganizationChart(url: string) {
  try {
    await prisma.siteSetting.upsert({
      where: { key: "organizationChartImage" },
      update: { value: url },
      create: { key: "organizationChartImage", value: url },
    });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan bagan organisasi" };
  }
}

export async function saveProfileVideo(url: string) {
  try {
    await prisma.siteSetting.upsert({
      where: { key: "profileVideoUrl" },
      update: { value: url },
      create: { key: "profileVideoUrl", value: url },
    });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan URL video" };
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add actions/station.action.ts actions/parish-center.action.ts actions/organization.action.ts
git commit -m "feat: add station and parish center actions, simplify org action to chart upload"
```

---

### Task 5: Create public components and update public page

**Files:**
- Create: `components/public/organization-chart.tsx`
- Create: `components/public/parish-region.tsx`
- Modify: `app/(public)/profil/page.tsx`

**Interfaces:**
- Consumes:
  - Services from Task 3: `getParishCenter()`, `getStations()`
  - SiteSetting: `organizationChartImage` key
- Produces: Rendered public page with three sections

- [ ] **Step 1: Create `components/public/organization-chart.tsx`**

```tsx
"use client";

interface OrganizationChartProps {
  imageUrl: string | null;
}

export function OrganizationChart({ imageUrl }: OrganizationChartProps) {
  if (!imageUrl) return null;

  return (
    <section className="bg-slate-50 py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Struktur Organisasi
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Bagan struktur organisasi Gereja Paroki Sandai
          </p>
        </div>
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <img
            src={imageUrl}
            alt="Struktur Organisasi Paroki Sandai"
            className="mx-auto h-auto w-full max-w-4xl object-contain p-4"
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `components/public/parish-region.tsx`**

```tsx
import { Church, MapPin } from "lucide-react";
import { getParishCenter, getStations } from "@/services/organization.service";

export async function ParishRegion() {
  const center = await getParishCenter();
  const stations = await getStations();

  if (!center && stations.length === 0) return null;

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Wilayah
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Pusat paroki dan stasi dalam naungan Paroki Sandai
          </p>
        </div>

        {center && (
          <div className="mb-8 rounded-xl border-2 border-blue-200 bg-blue-50 p-6 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Church className="h-6 w-6 text-blue-700" />
            </div>
            <h3 className="text-lg font-bold text-blue-900">{center.name}</h3>
            <p className="mt-1 text-sm text-blue-700">
              Pelindung: {center.patron}
            </p>
          </div>
        )}

        {stations.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {stations.map((station) => (
              <div
                key={station.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="text-base font-bold text-slate-900">
                  {station.name}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Pelindung: {station.patron}
                </p>
                {station.address && (
                  <p className="mt-2 flex items-start gap-1 text-xs text-slate-500">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{station.address}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm italic text-slate-500">
            Belum ada data stasi.
          </p>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Update `app/(public)/profil/page.tsx`**

Replace content:

```tsx
import { Metadata } from "next";
import { getSetting } from "@/services/site-setting.service";
import { ProfileVideo } from "@/components/public/profile-video";
import { OrganizationChart } from "@/components/public/organization-chart";
import { ParishRegion } from "@/components/public/parish-region";

export const metadata: Metadata = {
  title: "Profil Paroki | Paroki Sandai",
  description:
    "Profil Gereja Katolik Paroki Sandai — video profil, struktur organisasi, dan wilayah pelayanan.",
};

export default async function ProfilPage() {
  const profileVideoUrl = await getSetting("profileVideoUrl");
  const organizationChartImage = await getSetting("organizationChartImage");

  return (
    <>
      <ProfileVideo url={profileVideoUrl} />
      <OrganizationChart imageUrl={organizationChartImage} />
      <ParishRegion />
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/public/organization-chart.tsx components/public/parish-region.tsx app/\(public\)/profil/page.tsx
git commit -m "feat: add organization chart, parish region components, and update public profile page"
```

---

### Task 6: Update CMS admin dashboard

**Files:**
- Modify: `app/dashboard/profil/profil-client.tsx`
- Modify: `app/dashboard/profil/page.tsx`

**Interfaces:**
- Consumes:
  - Actions from Task 4: `saveProfileVideo`, `saveOrganizationChart`, `saveParishCenter`, `createStation`, `updateStation`, `deleteStation`
  - Services from Task 3: `getParishCenter`, `getStations`
  - SiteSetting: `organizationChartImage`
- Produces: CMS dashboard with 3 tabs (Video, Bagan Organisasi, Wilayah)

- [ ] **Step 1: Update `app/dashboard/profil/page.tsx`**

Replace content:

```tsx
import { getSetting } from "@/services/site-setting.service";
import { getParishCenter } from "@/services/organization.service";
import { getStations } from "@/services/organization.service";
import { ProfilClient } from "./profil-client";

export default async function ProfilPage() {
  const videoUrl = (await getSetting("profileVideoUrl")) ?? "";
  const chartImage = (await getSetting("organizationChartImage")) ?? "";
  const center = await getParishCenter();
  const stations = await getStations();

  return (
    <ProfilClient
      videoUrl={videoUrl}
      chartImage={chartImage}
      center={center}
      stations={stations}
    />
  );
}
```

- [ ] **Step 2: Update `app/dashboard/profil/profil-client.tsx`**

Replace all content:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveProfileVideo,
  saveOrganizationChart,
} from "@/actions/organization.action";
import { saveParishCenter } from "@/actions/parish-center.action";
import {
  createStation,
  updateStation,
  deleteStation,
} from "@/actions/station.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Loader2, Upload } from "lucide-react";

interface StationData {
  id: number;
  name: string;
  patron: string;
  address: string | null;
  orderIndex: number;
}

interface ProfilClientProps {
  videoUrl: string;
  chartImage: string;
  center: { id: number; name: string; patron: string } | null;
  stations: StationData[];
}

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

function StationFormDialog({
  initial,
  onSaved,
  open,
  onOpenChange,
}: {
  initial?: StationData;
  onSaved: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [patron, setPatron] = useState(initial?.patron ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [orderIndex, setOrderIndex] = useState(
    String(initial?.orderIndex ?? 0)
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      patron,
      address: address || null,
      orderIndex: Number(orderIndex) || 0,
    };
    const result = isEdit
      ? await updateStation(initial!.id, payload)
      : await createStation(payload);
    setSaving(false);
    if (!result?.success) {
      toast.error(result?.error ?? "Gagal menyimpan");
      return;
    }
    toast.success(
      isEdit ? "Stasi berhasil diperbarui" : "Stasi berhasil ditambahkan"
    );
    onOpenChange(false);
    onSaved();
  }

  function handleDelete() {
    if (!confirm("Hapus stasi ini? Data tidak bisa dikembalikan.")) return;
    deleteStation(initial!.id).then((r) => {
      if (!r?.success) {
        toast.error(r?.error ?? "Gagal menghapus");
        return;
      }
      toast.success("Stasi berhasil dihapus");
      onOpenChange(false);
      onSaved();
    });
  }

  return null; // placeholder — see full implementation below
}
```

Wait — this file is very large. Let me write the complete, correct file.

The full content of `profil-client.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveProfileVideo,
  saveOrganizationChart,
} from "@/actions/organization.action";
import { saveParishCenter } from "@/actions/parish-center.action";
import {
  createStation,
  updateStation,
  deleteStation,
} from "@/actions/station.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Loader2, Upload } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface StationData {
  id: number;
  name: string;
  patron: string;
  address: string | null;
  orderIndex: number;
}

interface ProfilClientProps {
  videoUrl: string;
  chartImage: string;
  center: { id: number; name: string; patron: string } | null;
  stations: StationData[];
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Station Form Dialog                                                       */
/* -------------------------------------------------------------------------- */

function StationFormDialog({
  initial,
  onSaved,
  open,
  onOpenChange,
}: {
  initial?: StationData;
  onSaved: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [patron, setPatron] = useState(initial?.patron ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [orderIndex, setOrderIndex] = useState(
    String(initial?.orderIndex ?? 0)
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      patron,
      address: address || null,
      orderIndex: Number(orderIndex) || 0,
    };
    const result = isEdit
      ? await updateStation(initial!.id, payload)
      : await createStation(payload);
    setSaving(false);
    if (!result?.success) {
      toast.error(result?.error ?? "Gagal menyimpan");
      return;
    }
    toast.success(
      isEdit ? "Stasi berhasil diperbarui" : "Stasi berhasil ditambahkan"
    );
    onOpenChange(false);
    onSaved();
  }

  function handleDelete() {
    if (!confirm("Hapus stasi ini? Data tidak bisa dikembalikan.")) return;
    deleteStation(initial!.id).then((r) => {
      if (!r?.success) {
        toast.error(r?.error ?? "Gagal menghapus");
        return;
      }
      toast.success("Stasi berhasil dihapus");
      onOpenChange(false);
      onSaved();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Stasi" : "Tambah Stasi"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="s-name">
              Nama Stasi <span className="text-destructive">*</span>
            </Label>
            <Input
              id="s-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Stasi Santo Yusuf"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-patron">
              Nama Pelindung <span className="text-destructive">*</span>
            </Label>
            <Input
              id="s-patron"
              value={patron}
              onChange={(e) => setPatron(e.target.value)}
              required
              placeholder="Santo Yusuf"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-address">Alamat</Label>
            <Input
              id="s-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Contoh No. 123"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-order">Urutan</Label>
            <Input
              id="s-order"
              type="number"
              min={0}
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Angka kecil tampil lebih dahulu.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            {isEdit && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="mr-1 h-4 w-4" /> Hapus
              </Button>
            )}
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Tambah Stasi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Profil Client                                                        */
/* -------------------------------------------------------------------------- */

export function ProfilClient({
  videoUrl,
  chartImage,
  center,
  stations,
}: ProfilClientProps) {
  const router = useRouter();

  /* ----- video tab ----- */
  const [video, setVideo] = useState(videoUrl);
  const [savingVideo, setSavingVideo] = useState(false);
  const videoId = extractYouTubeId(video);

  const handleSaveVideo = async () => {
    setSavingVideo(true);
    const result = await saveProfileVideo(video);
    setSavingVideo(false);
    if (!result?.success) {
      toast.error(result?.error ?? "Gagal menyimpan URL video");
      return;
    }
    toast.success("Video profil berhasil disimpan");
    router.refresh();
  };

  /* ----- chart tab ----- */
  const [chart, setChart] = useState(chartImage);
  const [uploadingChart, setUploadingChart] = useState(false);
  const [savingChart, setSavingChart] = useState(false);

  const handleChartUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingChart(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Upload gagal");
      setChart(data.url);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah gambar");
    } finally {
      setUploadingChart(false);
    }
  };

  const handleSaveChart = async () => {
    setSavingChart(true);
    const result = await saveOrganizationChart(chart);
    setSavingChart(false);
    if (!result?.success) {
      toast.error(result?.error ?? "Gagal menyimpan bagan organisasi");
      return;
    }
    toast.success("Bagan organisasi berhasil disimpan");
    router.refresh();
  };

  /* ----- wilayah tab ----- */
  const [centerName, setCenterName] = useState(center?.name ?? "");
  const [centerPatron, setCenterPatron] = useState(center?.patron ?? "");
  const [savingCenter, setSavingCenter] = useState(false);

  const handleSaveCenter = async () => {
    setSavingCenter(true);
    const result = await saveParishCenter({
      name: centerName,
      patron: centerPatron,
    });
    setSavingCenter(false);
    if (!result?.success) {
      toast.error(result?.error ?? "Gagal menyimpan pusat paroki");
      return;
    }
    toast.success("Pusat paroki berhasil disimpan");
    router.refresh();
  };

  const [stationDialogOpen, setStationDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<
    StationData | undefined
  >(undefined);

  const openAddStation = () => {
    setEditingStation(undefined);
    setStationDialogOpen(true);
  };

  const openEditStation = (station: StationData) => {
    setEditingStation(station);
    setStationDialogOpen(true);
  };

  /* ---------------------------------------------------------------------- */
  /*  Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Paroki</h1>
        <p className="text-muted-foreground">
          Kelola video profil, bagan organisasi, dan wilayah paroki.
        </p>
      </div>

      <Tabs defaultValue="video">
        <TabsList>
          <TabsTrigger value="video">Video Profil</TabsTrigger>
          <TabsTrigger value="bagan">Bagan Organisasi</TabsTrigger>
          <TabsTrigger value="wilayah">Wilayah</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Video Profil ─────────────────────────────────────── */}
        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>Video Profil Paroki</CardTitle>
              <CardDescription>
                Masukkan URL video YouTube untuk ditampilkan di halaman profil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-url">URL Video YouTube</Label>
                <Input
                  id="video-url"
                  value={video}
                  onChange={(e) => setVideo(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              {videoId && (
                <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-slate-200">
                  <div className="relative aspect-video w-full">
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                      title="Preview Video Profil"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={handleSaveVideo} disabled={savingVideo}>
                  {savingVideo && (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  )}
                  Simpan Video
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Bagan Organisasi ─────────────────────────────────── */}
        <TabsContent value="bagan">
          <Card>
            <CardHeader>
              <CardTitle>Bagan Struktur Organisasi</CardTitle>
              <CardDescription>
                Unggah gambar bagan struktur organisasi paroki.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {chart && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img
                    src={chart}
                    alt="Preview bagan organisasi"
                    className="mx-auto h-auto w-full max-w-3xl object-contain p-4"
                  />
                </div>
              )}
              <div className="flex items-center gap-3">
                <Label
                  htmlFor="chart-upload"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
                >
                  {uploadingChart ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {chart ? "Ganti Gambar" : "Unggah Gambar Bagan"}
                </Label>
                <Input
                  id="chart-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleChartUpload}
                  disabled={uploadingChart}
                  className="hidden"
                />
                {chart && (
                  <button
                    type="button"
                    onClick={() => setChart("")}
                    className="text-sm text-destructive hover:underline"
                  >
                    Hapus gambar
                  </button>
                )}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveChart} disabled={savingChart}>
                  {savingChart && (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  )}
                  Simpan Bagan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Wilayah ──────────────────────────────────────────── */}
        <TabsContent value="wilayah">
          <div className="space-y-6">
            {/* Pusat Paroki */}
            <Card>
              <CardHeader>
                <CardTitle>Pusat Paroki</CardTitle>
                <CardDescription>
                  Informasi pusat paroki — nama lengkap dan pelindung.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="center-name">
                    Nama Paroki <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="center-name"
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                    required
                    placeholder="Paroki Santo Paulus Sandai"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="center-patron">
                    Nama Pelindung <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="center-patron"
                    value={centerPatron}
                    onChange={(e) => setCenterPatron(e.target.value)}
                    required
                    placeholder="Santo Paulus"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveCenter} disabled={savingCenter}>
                    {savingCenter && (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    )}
                    Simpan Pusat Paroki
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabel Stasi */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Stasi</CardTitle>
                  <CardDescription>
                    Daftar stasi dalam naungan paroki.
                  </CardDescription>
                </div>
                <Button onClick={openAddStation}>
                  <Plus className="mr-1 h-4 w-4" /> Tambah Stasi
                </Button>
              </CardHeader>
              <CardContent>
                {stations.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                    <p className="text-sm">Belum ada data stasi.</p>
                    <p className="text-xs mt-1">
                      Klik &ldquo;Tambah Stasi&rdquo; untuk menambahkan.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Stasi</TableHead>
                        <TableHead>Pelindung</TableHead>
                        <TableHead>Alamat</TableHead>
                        <TableHead className="w-20">Urutan</TableHead>
                        <TableHead className="w-24">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stations.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">
                            {s.name}
                          </TableCell>
                          <TableCell>{s.patron}</TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {s.address || "-"}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {s.orderIndex}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openEditStation(s)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <StationFormDialog
        initial={editingStation}
        open={stationDialogOpen}
        onOpenChange={setStationDialogOpen}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/profil/page.tsx app/dashboard/profil/profil-client.tsx
git commit -m "feat: update CMS dashboard with 3 tabs — video, chart upload, and wilayah management"
```

---

### Task 7: Cleanup and verify

**Files:**
- Delete: `components/public/organization-grid.tsx`

**Interfaces:**
- Consumes: Nothing new (all preceding tasks complete)
- Produces: Clean build with no errors

- [ ] **Step 1: Delete old organization grid component**

```bash
rm components/public/organization-grid.tsx
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: No errors. Warnings from old code are acceptable.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: Successful build with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add -u components/public/organization-grid.tsx
git commit -m "chore: remove unused organization-grid component"
```

---
