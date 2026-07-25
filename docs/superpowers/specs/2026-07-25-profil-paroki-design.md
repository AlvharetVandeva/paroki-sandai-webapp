# Design Spec: Halaman Profil Paroki

**Tanggal**: 2026-07-25
**Status**: Approved
**Fitur**: Halaman publik Profil Paroki + CMS dashboard untuk mengelola kontennya.

---

## Ringkasan

Menambahkan halaman "Profil Paroki" di public website dengan dua section:
1. Video profil (YouTube embed)
2. Struktur organisasi (grid card anggota)

Semua konten dikelola lewat CMS dashboard admin di `/dashboard/profil`.

---

## Data Model

### Model Baru: `OrganizationMember`

```prisma
model OrganizationMember {
  id          Int      @id @default(autoincrement())
  name        String                        // nama anggota
  position    String                        // jabatan
  photo       String?                       // URL foto hasil upload
  orderIndex  Int      @default(0)          // urutan tampil (ascending)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Alasan: data terstruktur sehingga type-safe, queryable, mudah di-CRUD. Mengikuti pola `Person` / `Event` yang sudah ada.

### SiteSetting Keys Baru

| Key              | Value                         |
|------------------|-------------------------------|
| `profileVideoUrl` | URL YouTube embed (string)    |

Alasan: konfigurasi tunggal sederhana, cocok dengan model key-value `SiteSetting` yang sudah ada. Tidak perlu model terpisah.

---

## Public Page — `/profil`

### File Baru

| File                                      | Deskripsi                                        |
|-------------------------------------------|--------------------------------------------------|
| `app/(public)/profil/page.tsx`            | Halaman profil (Server Component)                |
| `components/public/profile-video.tsx`     | Embed YouTube dengan fallback kosong             |
| `components/public/organization-grid.tsx` | Grid card anggota struktur organisasi (Client)   |
| `services/organization.service.ts`        | Query `getAllMembers()` untuk halaman publik     |

### Layout & Visual

```
┌─────────────────────────────────────────────────┐
│  Header: Profil Paroki                           │
│  (judul h2 bold + decorative divider)            │
├─────────────────────────────────────────────────┤
│  Video Profil                                    │
│  ┌─────────────────────────────────────────────┐│
│  │  iframe YouTube 16:9                        ││
│  │  rounded-xl, shadow-sm, overflow-hidden     ││
│  └─────────────────────────────────────────────┘│
│  * Hidden entirely jika profileVideoUrl null    │
├─────────────────────────────────────────────────┤
│  Struktur Organisasi                             │
│  ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ avatar │ │ avatar │ │ avatar │  grid 3 col   │
│  │ Nama   │ │ Nama   │ │ Nama   │  (responsive) │
│  │ Jabatan│ │ Jabatan│ │ Jabatan│               │
│  └────────┘ └────────┘ └────────┘              │
│  * Empty state: "Struktur organisasi belum ada" │
└─────────────────────────────────────────────────┘
```

**Style**: Card-based masonry grid, max-width 5xl, padding py-12. Card: bg-white, rounded-xl, border, shadow-sm, hover shadow-md. Avatar: rounded-full, w-24 h-24, object-cover, fallback bg-slate-100 + icon User.

**State Handling**:
- Video kosong → section tidak dirender
- Anggota kosong → section dengan teks "Struktur organisasi belum tersedia"

### Komponen Public yang Digunakan Kembali

- `PublicNavbar` — tambah item `{ href: "/profil", label: "Profil Paroki" }`
- `PublicFooter` — sudah ada, tidak perlu perubahan
- `prose` class dari `@tailwindcss/typography` untuk styling konten

---

## Dashboard CMS — `/dashboard/profil`

### File Baru

| File                                          | Deskripsi                                      |
|-----------------------------------------------|------------------------------------------------|
| `app/dashboard/profil/page.tsx`               | Server Component: auth guard, load data awal   |
| `app/dashboard/profil/profil-client.tsx`      | Client Component: tabs, form video, tabel CRUD |
| `actions/organization.action.ts`              | Server Actions: CRUD `OrganizationMember`      |
| `schemas/organization.schema.ts`              | Zod schema: name, position, photo, orderIndex  |

### Struktur Halaman CMS

Satu halaman dengan dua tab (shadcn/ui Tabs):

**Tab 1 — Video Profil**
- Input text untuk YouTube URL
- Preview iframe embed (real-time saat user ketik/debounce)
- Tombol "Simpan" → Server Action `saveProfileVideo(url)`
- Toast sukses/gagal

**Tab 2 — Struktur Organisasi**
- Tombol "Tambah Anggota" → dialog form (nama, jabatan, upload foto, urutan)
- Tabel dengan kolom: Foto | Nama | Jabatan | Order | Aksi (✏️ 🗑️)
- Upload foto via `/api/upload` (sharp WebP compression — sudah ada)
- Drag-and-drop tidak diimplementasikan di rilis pertama; urutan diatur lewat input number `orderIndex`
- Delete dengan confirmation dialog

### Komponen Dashboard yang Digunakan Kembali

- shadcn/ui: `Table`, `Dialog`, `Input`, `Label`, `Button`, `Tabs`, `Badge`
- `app-dashboard-sidebar` — tambah item baru
- `/api/upload` — upload gambar yang sudah ada
- `toast` (sonner) — notifikasi
- Zod + Server Actions pattern yang sudah ada

### Sidebar

Tambah di `NAV_ITEMS` di [app-sidebar.tsx](components/app-sidebar.tsx):

```tsx
{ label: "Profil Paroki", href: "/dashboard/profil", icon: Church, resource: "settings" }
```

Posisi: setelah "Sejarah Gereja", sebelum "Jenis Pelayanan".

---

## Public Navbar

Tambah di `navLinks` di [public-navbar.tsx](components/public/public-navbar.tsx#L16-L24):

```tsx
{ href: "/", label: "Beranda" },
{ href: "/profil", label: "Profil Paroki" },  // ← BARU
{ href: "/jadwal", label: "Jadwal" },
// ... sisanya tetap
```

Navigasi mobile sheet juga otomatis mengikuti array `navLinks`.

---

## Data Flow

```
┌──────────────────────────────────────────────────────────┐
│  DASHBOARD CMS (/dashboard/profil)                       │
│                                                          │
│  [Tab Video]                     [Tab Struktur]          │
│  Input URL ──► saveSetting()     Form ──► createMember()│
│                        │                        │        │
│                        ▼                        ▼        │
│               SiteSetting table       OrganizationMember │
│               (profileVideoUrl)       table              │
│                        │                        │        │
└────────────────────────┼────────────────────────┼────────┘
                         │                        │
                         ▼                        ▼
┌──────────────────────────────────────────────────────────┐
│  PUBLIC PAGE (/profil)                                   │
│                                                          │
│  getSetting("profileVideoUrl") ──► ProfileVideo embed    │
│  getAllMembers() ──► OrganizationGrid cards              │
└──────────────────────────────────────────────────────────┘
```

---

## Zod Schema

```ts
// schemas/organization.schema.ts
import { z } from "zod";

export const OrganizationMemberSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  position: z.string().min(2, "Jabatan minimal 2 karakter").max(100),
  photo: z.string().url().optional().or(z.literal("")),
  orderIndex: z.coerce.number().int().min(0).default(0),
});
```

---

## Permission & Auth

- Dashboard CMS `/dashboard/profil` diproteksi oleh middleware `proxy.ts` (sudah ada)
- Halaman sidebar dicek permission `settings:read` (sesuai dengan resource `"settings"` di nav item)
- Tidak perlu permission baru

---

## Referensi Layout

1. **YouTube embed card**: Full-width, aspect-ratio 16/9, rounded-2xl, shadow-lg, ring-1 ring-slate-200.
2. **Organization grid**: Terinspirasi dari halaman "Our Team" di website gereja modern. 3-column grid desktop, 2 tablet, 1 mobile. Avatar dengan shadow inner ring putih.
3. **Warna konsisten**: Card pakai `bg-white border-slate-200`, text `slate-900/600`, aksen `blue-600`.

---

## File Tree — Semua File Terdampak

```
├── prisma/
│   └── schema.prisma                    # ADD: model OrganizationMember
│   └── migrations/                      # ADD: migration baru
│   └── seed.ts                          # UPDATE: seed data contoh
├── app/
│   ├── (public)/
│   │   └── profil/
│   │       └── page.tsx                 # NEW: halaman publik profil
│   └── dashboard/
│       └── profil/
│           ├── page.tsx                 # NEW: halaman CMS (Server)
│           └── profil-client.tsx        # NEW: halaman CMS (Client)
├── components/
│   ├── public/
│   │   ├── profile-video.tsx           # NEW: komponen embed YouTube
│   │   ├── organization-grid.tsx       # NEW: komponen grid struktur
│   │   └── public-navbar.tsx           # UPDATE: tambah menu "Profil Paroki"
│   └── app-sidebar.tsx                 # UPDATE: tambah menu sidebar
├── actions/
│   └── organization.action.ts          # NEW: CRUD Server Actions
├── services/
│   └── organization.service.ts         # NEW: query publik
├── schemas/
│   └── organization.schema.ts          # NEW: Zod validation
└── lib/generated/prisma/              # REGENERATE: prisma client
```

---

## Verification

```bash
npx prisma migrate dev --name add_organization_member
npm run lint
npm run build
```
