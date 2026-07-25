# Profil Paroki — Implementation Plan

> **Untuk agentic workers:** REQUIRED SUB-SKILL: Gunakan superpowers:subagent-driven-development (disarankan) atau superpowers:executing-plans untuk mengimplementasikan plan ini task-by-task. Steps menggunakan checkbox (`- [ ]`) untuk tracking.

**Goal:** Membangun halaman publik `/profil` dengan video YouTube embed dan grid struktur organisasi, dikelola lewat CMS dashboard `/dashboard/profil`.

**Architecture:** Model Prisma baru `OrganizationMember` untuk data terstruktur anggota + SiteSetting key `profileVideoUrl` untuk video. Public page sebagai Server Component memanggil service layer. Dashboard CMS sebagai Client Component dengan dua tab (Video + Struktur) memanggil Server Actions. Pola mengikuti `Sejarah Gereja` (single page CMS) + `Event` (CRUD table).

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma, Zod, shadcn/ui, Tiptap, Tailwind CSS v4, sonner toast

## Global Constraints

- Semua komponen public menggunakan Server Components, kecuali komponen dengan interaksi client
- Mutasi data lewat Server Actions di folder `actions/`
- Query read-only di folder `services/`
- Validasi input menggunakan Zod di folder `schemas/`
- Dashboard CMS menggunakan shadcn/ui
- Auth guard dashboard sudah ada via `proxy.ts`
- Upload gambar menggunakan `/api/upload` yang sudah ada
- Bahasa Indonesia untuk semua label UI dan pesan error/sukses

---

### Task 1: Data Model — Prisma Schema + Migration

**Files:**
- Modify: `prisma/schema.prisma` (add `OrganizationMember` model)
- Create: migration via `npx prisma migrate dev --name add_organization_member`

**Interfaces:**
- Produces: `OrganizationMember` model dengan fields: `id`, `name`, `position`, `photo` (nullable), `orderIndex`, `createdAt`, `updatedAt`

- [ ] **Step 1: Tambah model OrganizationMember ke schema.prisma**

Buka `prisma/schema.prisma`. Tambah setelah model `GalleryImage`:

```prisma
// ─── Profil Paroki ──────────────────────────────────────────────────────────

model OrganizationMember {
  id         Int      @id @default(autoincrement())
  name       String
  position   String
  photo      String?
  orderIndex Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

- [ ] **Step 2: Jalankan migration**

```bash
npx prisma migrate dev --name add_organization_member
```

Expected: Migration berhasil, Prisma client ter-regenerate di `lib/generated/prisma/`.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add OrganizationMember model for profil paroki

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Zod Schema — Validation Layer

**Files:**
- Create: `schemas/organization.schema.ts`

**Interfaces:**
- Produces: `OrganizationMemberSchema` (Zod object), `OrganizationMemberInput` type

- [ ] **Step 1: Buat schema validasi**

Buat file `schemas/organization.schema.ts`:

```typescript
import { z } from "zod";

export const OrganizationMemberSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  position: z
    .string()
    .min(2, "Jabatan minimal 2 karakter")
    .max(100, "Jabatan maksimal 100 karakter"),
  photo: z
    .string()
    .url("URL foto tidak valid")
    .optional()
    .or(z.literal("")),
  orderIndex: z.coerce.number().int().min(0).default(0),
});

export const OrganizationMemberUpdateSchema = OrganizationMemberSchema.partial();

export type OrganizationMemberInput = z.infer<typeof OrganizationMemberSchema>;
export type OrganizationMemberUpdate = z.infer<typeof OrganizationMemberUpdateSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add schemas/organization.schema.ts
git commit -m "feat: add Zod schema for OrganizationMember

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Service Layer — Public Read Queries

**Files:**
- Create: `services/organization.service.ts`

**Interfaces:**
- Produces: `getAllMembers()` → `Promise<OrganizationMember[]>` (ordered by `orderIndex asc`)

- [ ] **Step 1: Buat service untuk query publik**

Buat file `services/organization.service.ts`:

```typescript
import prisma from "@/lib/prisma";

export async function getAllMembers() {
  return prisma.organizationMember.findMany({
    orderBy: { orderIndex: "asc" },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add services/organization.service.ts
git commit -m "feat: add service layer for OrganizationMember queries

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Server Actions — CRUD OrganizationMember + SiteSetting

**Files:**
- Create: `actions/organization.action.ts`

**Interfaces:**
- Consumes: `OrganizationMemberSchema` from `schemas/organization.schema.ts`
- Produces:
  - `createMember(data: OrganizationMemberInput)` → `Promise<{ success: boolean; error?: string }>`
  - `updateMember(id: number, data: OrganizationMemberUpdate)` → `Promise<{ success: boolean; error?: string }>`
  - `deleteMember(id: number)` → `Promise<{ success: boolean; error?: string }>`
  - `saveProfileVideo(url: string)` → `Promise<{ success: boolean; error?: string }>`

- [ ] **Step 1: Buat Server Actions**

Buat file `actions/organization.action.ts`:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  OrganizationMemberSchema,
  OrganizationMemberUpdateSchema,
} from "@/schemas/organization.schema";

export async function createMember(data: Record<string, unknown>) {
  try {
    const parsed = OrganizationMemberSchema.parse(data);
    await prisma.organizationMember.create({ data: parsed });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menambah anggota" };
  }
}

export async function updateMember(id: number, data: Record<string, unknown>) {
  try {
    const parsed = OrganizationMemberUpdateSchema.parse(data);
    await prisma.organizationMember.update({
      where: { id },
      data: parsed,
    });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengubah anggota" };
  }
}

export async function deleteMember(id: number) {
  try {
    await prisma.organizationMember.delete({ where: { id } });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus anggota" };
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

- [ ] **Step 2: Commit**

```bash
git add actions/organization.action.ts
git commit -m "feat: add Server Actions for OrganizationMember CRUD + profile video

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Public Navbar — Tambah Menu Profil Paroki

**Files:**
- Modify: `components/public/public-navbar.tsx:16-24` (insert new nav item)

- [ ] **Step 1: Tambah menu "Profil Paroki" di antara Beranda dan Jadwal**

Di file `components/public/public-navbar.tsx`, ubah array `navLinks`:

```typescript
const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil Paroki" },
  { href: "/jadwal", label: "Jadwal" },
  { href: "/pengumuman", label: "Pengumuman" },
  { href: "/kegiatan", label: "Kegiatan" },
  { href: "/berita", label: "Berita" },
  { href: "/galeri", label: "Galeri" },
  { href: "/sejarah", label: "Sejarah" },
];
```

- [ ] **Step 2: Verifikasi build**

```bash
npm run build
```

Expected: Tidak ada error dari public-navbar.tsx.

- [ ] **Step 3: Commit**

```bash
git add components/public/public-navbar.tsx
git commit -m "feat: add Profil Paroki link to public navbar

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: Public Page Components — Video & Grid

**Files:**
- Create: `components/public/profile-video.tsx`
- Create: `components/public/organization-grid.tsx`

**Interfaces:**
- `ProfileVideo` — Client Component, props: `url: string | null`, extract YouTube video ID dari URL, render iframe embed. Tidak render apa-apa jika url null.
- `OrganizationGrid` — Client Component, props: `members: OrganizationMember[]`, render grid card anggota. Empty state jika array kosong.

- [ ] **Step 1: Buat komponen ProfileVideo**

Buat file `components/public/profile-video.tsx`:

```typescript
"use client";

interface ProfileVideoProps {
  url: string | null;
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

export function ProfileVideo({ url }: ProfileVideoProps) {
  if (!url) return null;

  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Video Profil
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Mengenal lebih dekat kehidupan Gereja Paroki Sandai
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200">
          <div className="relative aspect-video w-full">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title="Video Profil Paroki Sandai"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Buat komponen OrganizationGrid**

Buat file `components/public/organization-grid.tsx`:

```typescript
"use client";

import { User } from "lucide-react";

interface Member {
  id: number;
  name: string;
  position: string;
  photo: string | null;
}

interface OrganizationGridProps {
  members: Member[];
}

export function OrganizationGrid({ members }: OrganizationGridProps) {
  return (
    <section className="bg-slate-50 py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Struktur Organisasi
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Para pelayan dan pengurus Gereja Paroki Sandai
          </p>
        </div>

        {members.length === 0 ? (
          <p className="text-center text-sm italic text-slate-500">
            Struktur organisasi belum tersedia.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="group rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-4 ring-white">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-slate-400" />
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{member.position}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/public/profile-video.tsx components/public/organization-grid.tsx
git commit -m "feat: add ProfileVideo and OrganizationGrid public components

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: Public Page — `/profil`

**Files:**
- Create: `app/(public)/profil/page.tsx`

**Interfaces:**
- Consumes: `getSetting()` from `services/site-setting.service.ts`, `getAllMembers()` from `services/organization.service.ts`
- Produces: Full page render with `ProfileVideo` + `OrganizationGrid`

- [ ] **Step 1: Buat halaman profil**

Buat file `app/(public)/profil/page.tsx`:

```typescript
import { Metadata } from "next";
import { getSetting } from "@/services/site-setting.service";
import { getAllMembers } from "@/services/organization.service";
import { ProfileVideo } from "@/components/public/profile-video";
import { OrganizationGrid } from "@/components/public/organization-grid";

export const metadata: Metadata = {
  title: "Profil Paroki | Paroki Sandai",
  description:
    "Profil Gereja Katolik Paroki Sandai — video profil dan struktur organisasi pelayan paroki.",
};

export default async function ProfilPage() {
  const profileVideoUrl = await getSetting("profileVideoUrl");
  const members = await getAllMembers();

  return (
    <>
      <ProfileVideo url={profileVideoUrl} />
      <OrganizationGrid members={members} />
    </>
  );
}
```

- [ ] **Step 2: Verifikasi build**

```bash
npm run build
```

Expected: Tidak ada error. Halaman `/profil` terakses.

- [ ] **Step 3: Commit**

```bash
git add app/\(public\)/profil/page.tsx
git commit -m "feat: add public Profil Paroki page with video and organization grid

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: Dashboard Sidebar — Tambah Menu Profil Paroki

**Files:**
- Modify: `components/app-sidebar.tsx:37-48` (insert new nav item + import Church icon)

- [ ] **Step 1: Tambah icon Church dari lucide-react dan item nav**

Di file `components/app-sidebar.tsx`, tambah `Church` di import lucide-react:

```typescript
import {
  LayoutDashboard,
  Calendar,
  Users,
  Tags,
  PartyPopper,
  Megaphone,
  Newspaper,
  Settings,
  LogOut,
  ShieldAlert,
  UserCog,
  ImageIcon,
  Landmark,
  Church,
} from "lucide-react";
```

Tambah item di array `NAV_ITEMS` setelah "Sejarah Gereja":

```typescript
const NAV_ITEMS = [
  { label: "Beranda", href: "/dashboard", icon: LayoutDashboard, resource: "dashboard" },
  { label: "Jadwal", href: "/dashboard/schedules", icon: Calendar, resource: "schedules" },
  { label: "Petugas", href: "/dashboard/persons", icon: Users, resource: "persons" },
  { label: "Kegiatan", href: "/dashboard/events", icon: PartyPopper, resource: "events" },
  { label: "Pengumuman", href: "/dashboard/announcements", icon: Megaphone, resource: "announcements" },
  { label: "Berita", href: "/dashboard/news", icon: Newspaper, resource: "news" },
  { label: "Galeri", href: "/dashboard/gallery", icon: ImageIcon, resource: "gallery" },
  { label: "Sejarah Gereja", href: "/dashboard/history", icon: Landmark, resource: "settings" },
  { label: "Profil Paroki", href: "/dashboard/profil", icon: Church, resource: "settings" },
  { label: "Jenis Pelayanan", href: "/dashboard/roles", icon: Tags, resource: "service_roles" },
  { label: "Pengaturan", href: "/dashboard/settings", icon: Settings, resource: "settings" },
];
```

- [ ] **Step 2: Commit**

```bash
git add components/app-sidebar.tsx
git commit -m "feat: add Profil Paroki menu to dashboard sidebar

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 9: Dashboard CMS — Halaman Server + Client

**Files:**
- Create: `app/dashboard/profil/page.tsx`
- Create: `app/dashboard/profil/profil-client.tsx`

**Interfaces:**
- Server Component: load `getSetting("profileVideoUrl")` + `getAllMembers()`, render `ProfilClient`
- Client Component: Tabs (Video + Struktur), form video, table CRUD, dialog form

- [ ] **Step 1: Buat server component halaman CMS**

Buat file `app/dashboard/profil/page.tsx`:

```typescript
import { getSetting } from "@/services/site-setting.service";
import { getAllMembers } from "@/services/organization.service";
import { ProfilClient } from "./profil-client";

export default async function ProfilPage() {
  const videoUrl = (await getSetting("profileVideoUrl")) ?? "";
  const members = await getAllMembers();

  return <ProfilClient videoUrl={videoUrl} members={members} />;
}
```

- [ ] **Step 2: Buat client component halaman CMS**

Buat file `app/dashboard/profil/profil-client.tsx`:

```typescript
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  createMember,
  updateMember,
  deleteMember,
  saveProfileVideo,
} from "@/actions/organization.action";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

interface Member {
  id: number;
  name: string;
  position: string;
  photo: string | null;
  orderIndex: number;
}

interface ProfilClientProps {
  videoUrl: string;
  members: Member[];
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

function MemberFormDialog({
  initial,
  onSaved,
  open,
  onOpenChange,
}: {
  initial?: Member;
  onSaved: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [position, setPosition] = useState(initial?.position ?? "");
  const [photo, setPhoto] = useState(initial?.photo ?? "");
  const [orderIndex, setOrderIndex] = useState(
    String(initial?.orderIndex ?? 0)
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Upload gagal");
      setPhoto(data.url);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah foto");
    } finally {
      setUploading(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      position,
      photo: photo || undefined,
      orderIndex: Number(orderIndex) || 0,
    };
    const result = isEdit
      ? await updateMember(initial!.id, payload)
      : await createMember(payload);
    setSaving(false);
    if (!result?.success) {
      toast.error(result?.error ?? "Gagal menyimpan");
      return;
    }
    toast.success(isEdit ? "Anggota berhasil diperbarui" : "Anggota berhasil ditambahkan");
    onOpenChange(false);
    router.refresh();
  }

  function handleDelete() {
    if (!confirm("Hapus anggota ini? Data tidak bisa dikembalikan.")) return;
    deleteMember(initial!.id).then((r) => {
      if (!r?.success) {
        toast.error(r?.error ?? "Gagal menghapus");
        return;
      }
      toast.success("Anggota berhasil dihapus");
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Anggota" : "Tambah Anggota"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="m-name">Nama <span className="text-destructive">*</span></Label>
            <Input
              id="m-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Romo Yohanes Prasetyo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-position">Jabatan <span className="text-destructive">*</span></Label>
            <Input
              id="m-position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
              placeholder="Pastor Paroki"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-photo">Foto</Label>
            <div className="flex items-center gap-3">
              <Input
                id="m-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="flex-1"
              />
              {uploading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
            </div>
            {photo && (
              <div className="mt-2 flex items-center gap-2">
                <img src={photo} alt="Preview" className="h-10 w-10 rounded-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhoto("")}
                  className="text-xs text-destructive hover:underline"
                >
                  Hapus foto
                </button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-order">Urutan</Label>
            <Input
              id="m-order"
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
              {isEdit ? "Simpan Perubahan" : "Tambah Anggota"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProfilClient({ videoUrl, members }: ProfilClientProps) {
  const router = useRouter();
  const [video, setVideo] = useState(videoUrl);
  const [savingVideo, setSavingVideo] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);

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

  const openAdd = () => {
    setEditingMember(undefined);
    setDialogOpen(true);
  };

  const openEdit = (member: Member) => {
    setEditingMember(member);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Paroki</h1>
        <p className="text-muted-foreground">
          Kelola video profil dan struktur organisasi paroki.
        </p>
      </div>

      <Tabs defaultValue="video">
        <TabsList>
          <TabsTrigger value="video">Video Profil</TabsTrigger>
          <TabsTrigger value="struktur">Struktur Organisasi</TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="mt-4">
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
                  {savingVideo && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  Simpan Video
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="struktur" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Struktur Organisasi</CardTitle>
                <CardDescription>
                  Daftar anggota struktur organisasi paroki.
                </CardDescription>
              </div>
              <Button onClick={openAdd}>
                <Plus className="mr-1 h-4 w-4" /> Tambah Anggota
              </Button>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  <p className="text-sm">Belum ada anggota struktur organisasi.</p>
                  <p className="text-xs mt-1">
                    Klik &ldquo;Tambah Anggota&rdquo; untuk menambahkan.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Foto</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Jabatan</TableHead>
                      <TableHead className="w-20">Urutan</TableHead>
                      <TableHead className="w-24">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100">
                            {m.photo ? (
                              <img
                                src={m.photo}
                                alt={m.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs">
                                -
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{m.position}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {m.orderIndex}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEdit(m)}
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
        </TabsContent>
      </Tabs>

      <MemberFormDialog
        initial={editingMember}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verifikasi build**

```bash
npm run build
```

Expected: Tidak ada error. Halaman `/dashboard/profil` terakses.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/profil/page.tsx app/dashboard/profil/profil-client.tsx
git commit -m "feat: add Profil Paroki CMS dashboard with video and structure tabs

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 10: Integration Test — Flow Manual

- [ ] **Step 1: Jalankan dev server**

```bash
npm run dev
```

- [ ] **Step 2: Uji public page**

Buka `http://localhost:3000/profil`.
- ✅ Navbar tampil dengan menu "Profil Paroki" (highlight saat aktif)
- ✅ Halaman tampil tanpa error
- ✅ Section Struktur Organisasi muncul dengan teks "Struktur organisasi belum tersedia."
- ✅ Section Video tidak tampil (karena belum ada data)

- [ ] **Step 3: Uji dashboard CMS**

Login ke `http://localhost:3000/dashboard` sebagai superadmin.

Navigasi ke "Profil Paroki" di sidebar:
- ✅ Tab "Video Profil" tampil
- ✅ Input URL YouTube + preview + tombol Simpan
- ✅ Tab "Struktur Organisasi" tampil
- ✅ Tombol "Tambah Anggota" membuka dialog form
- ✅ Upload foto berfungsi
- ✅ CRUD anggota: tambah, edit, hapus
- ✅ Tabel menampilkan data dengan benar

- [ ] **Step 4: Uji data mengalir ke public**

Setelah tambah video dan anggota di dashboard:
- ✅ `/profil` menampilkan video embed YouTube
- ✅ `/profil` menampilkan grid card anggota struktur
- ✅ Foto tampil dengan benar
- ✅ Urutan card sesuai `orderIndex`

- [ ] **Step 5: Deploy check**

```bash
npm run build
```

Expected: Build sukses tanpa error. Semua halaman statis/pra-render berfungsi.

---

## Verification Checklist

```bash
npx prisma migrate dev --name add_organization_member
npm run lint
npm run build
```
