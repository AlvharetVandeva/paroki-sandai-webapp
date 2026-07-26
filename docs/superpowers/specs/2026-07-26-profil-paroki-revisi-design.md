# Design Spec: Revisi Profil Paroki — Bagan Organisasi & Wilayah

**Tanggal**: 2026-07-26
**Status**: Draft
**Fitur**: Merevisi struktur organisasi dari input per-orang menjadi upload bagan, menambah section Wilayah (Pusat Paroki + Stasi).

---

## Ringkasan

Dua perubahan pada halaman Profil Paroki:

1. **Struktur Organisasi**: Dari CRUD anggota per-orang (`OrganizationMember`) menjadi upload satu gambar bagan organisasi.
2. **Section Wilayah**: Menampilkan pusat paroki (nama + pelindung) dan daftar stasi (nama + pelindung + alamat) dengan CRUD admin.

Database dipindahkan ke server remote `101.50.1.79` (MySQL `parokis1_web`).

---

## Data Model

### Model Dihapus

- ❌ `OrganizationMember` — tidak lagi digunakan, diganti upload gambar bagan

### Model Baru

**`ParishCenter`** — singleton, satu row untuk pusat paroki:

```prisma
model ParishCenter {
  id        Int      @id @default(autoincrement())
  name      String                        // nama panjang paroki
  patron    String                        // nama pelindung
  updatedAt DateTime @updatedAt
}
```

**`Station`** — N rows, daftar stasi:

```prisma
model Station {
  id         Int      @id @default(autoincrement())
  name       String                       // nama stasi
  patron     String                       // nama pelindung stasi
  address    String?                      // alamat, nullable
  orderIndex Int      @default(0)         // urutan tampil
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### SiteSetting Key Baru

| Key | Value | Deskripsi |
|-----|-------|-----------|
| `organizationChartImage` | URL gambar | Bagan struktur organisasi |

Alasan pakai `SiteSetting`: satu gambar saja, tidak perlu model khusus. Konsisten dengan `profileVideoUrl`.

---

## Public Page — `/profil`

### Layout

```
┌─────────────────────────────────────────────────┐
│  Header: Profil Paroki                           │
├─────────────────────────────────────────────────┤
│  Section 1: Video Profil (tetap)                 │
│  iframe YouTube 16:9, hidden jika null           │
├─────────────────────────────────────────────────┤
│  Section 2: Struktur Organisasi (revisi)         │
│  Gambar bagan, max-w-4xl, rounded-xl, shadow-sm  │
│  Hidden jika organizationChartImage null         │
├─────────────────────────────────────────────────┤
│  Section 3: Wilayah (baru)                       │
│  ┌─ Pusat Paroki (card highlighted, blue-50)  ─┐ │
│  │  Nama Paroki + Pelindung                    │ │
│  ├─ Stasi (grid 2-col desktop, 1 mobile)      ─┤ │
│  │  Card: nama stasi, pelindung, alamat        │ │
│  │  Empty: "Belum ada data stasi"              │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### File Baru

| File | Deskripsi | Tipe |
|------|-----------|------|
| `components/public/organization-chart.tsx` | Render gambar bagan | Client |
| `components/public/parish-region.tsx` | Section wilayah (pusat + stasi) | Server |

### File Dihapus

- ❌ `components/public/organization-grid.tsx` — diganti `organization-chart.tsx`

### File Diubah

- `app/(public)/profil/page.tsx` — tambah fetch `organizationChartImage`, `parishCenter`, `stations`

### Data Flow

```
getSetting("profileVideoUrl")           → ProfileVideo
getSetting("organizationChartImage")    → OrganizationChart
getParishCenter()                       → ParishRegion (card pusat)
getStations()                           → ParishRegion (grid stasi)
```

---

## Dashboard CMS — `/dashboard/profil`

Tiga tab (shadcn/ui Tabs):

### Tab 1 — Video Profil (tetap)
Tidak berubah. Input URL YouTube + preview + simpan.

### Tab 2 — Bagan Organisasi (revisi)

- Upload gambar via `/api/upload`
- Preview gambar yang sudah diupload
- Tombol "Simpan" → `SiteSetting` key `organizationChartImage`
- Placeholder jika belum ada gambar

### Tab 3 — Wilayah (baru)

**Form Pusat Paroki** (atas):
- Input `name` — nama panjang paroki
- Input `patron` — nama pelindung
- Tombol simpan → `saveParishCenter()`

**Tabel Stasi** (bawah):
- Kolom: Nama Stasi | Pelindung | Alamat | Urutan | Aksi
- Tombol "Tambah Stasi" → dialog form (nama, pelindung, alamat, urutan)
- Edit / Delete dengan confirmation dialog

### File Baru

| File | Deskripsi |
|------|-----------|
| `actions/station.action.ts` | CRUD stasi (create, update, delete) |
| `actions/parish-center.action.ts` | Save/update pusat paroki |
| `schemas/station.schema.ts` | Zod: name, patron, address (nullable), orderIndex |
| `schemas/parish-center.schema.ts` | Zod: name, patron |

### File Diubah

| File | Deskripsi |
|------|-----------|
| `app/dashboard/profil/page.tsx` | Load bagan image + parish center + stations |
| `app/dashboard/profil/profil-client.tsx` | 3 tab, form bagan, form wilayah |
| `actions/organization.action.ts` | Hapus CRUD member, tambah `saveOrganizationChart` |

### File Dihapus

- ❌ `schemas/organization.schema.ts` — tidak lagi relevan

---

## Service Layer

| File | Deskripsi |
|------|-----------|
| `services/organization.service.ts` | **UPDATE**: hapus `getAllMembers()`, tambah `getParishCenter()` dan `getStations()` |

---

## Zod Schemas

```ts
// schemas/station.schema.ts
export const StationSchema = z.object({
  name: z.string().min(2, "Nama stasi minimal 2 karakter").max(100),
  patron: z.string().min(2, "Nama pelindung minimal 2 karakter").max(100),
  address: z.string().nullable().optional(),
  orderIndex: z.number().int().min(0).default(0),
});
```

```ts
// schemas/parish-center.schema.ts
export const ParishCenterSchema = z.object({
  name: z.string().min(2, "Nama paroki minimal 2 karakter").max(100),
  patron: z.string().min(2, "Nama pelindung minimal 2 karakter").max(100),
});
```

---

## Migration

Gunakan `prisma db push` karena database di remote server (bukan dev local):

```bash
npx prisma db push
npx prisma generate
```

Perubahan:
- Drop tabel `OrganizationMember`
- Create tabel `ParishCenter`
- Create tabel `Station`

---

## File Tree — Semua File Terdampak

```
├── prisma/
│   └── schema.prisma                        # UPDATE: hapus OrganizationMember, tambah ParishCenter + Station
│   └── migrations/                          # ADD: add_parish_center_and_station
├── app/
│   ├── (public)/profil/
│   │   └── page.tsx                         # UPDATE: fetch data baru
│   └── dashboard/profil/
│       ├── page.tsx                         # UPDATE: load data baru
│       └── profil-client.tsx                # UPDATE: 3 tab
├── components/public/
│   ├── organization-chart.tsx               # NEW: render gambar bagan
│   ├── parish-region.tsx                    # NEW: section wilayah
│   └── organization-grid.tsx                # DELETE
├── actions/
│   ├── organization.action.ts              # UPDATE: hapus CRUD member, tambah saveChart
│   ├── station.action.ts                   # NEW: CRUD stasi
│   └── parish-center.action.ts             # NEW: save pusat paroki
├── services/
│   └── organization.service.ts             # UPDATE: ganti query
├── schemas/
│   ├── organization.schema.ts              # DELETE
│   ├── station.schema.ts                   # NEW
│   └── parish-center.schema.ts             # NEW
└── .env.local                              # UPDATE: koneksi ke server remote
```

---

## Verification

```bash
npx prisma generate
npm run lint
npm run build
```
