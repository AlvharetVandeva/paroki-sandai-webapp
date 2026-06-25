@AGENTS.md

# Project Context: Website Paroki Sandai

Website ini dikembangkan untuk kebutuhan informasi dan pelayanan digital sebuah gereja paroki. Fokus utama website adalah publikasi informasi paroki dan pengelolaan kalender jadwal pelayanan.

## Bahasa dan Gaya Komunikasi

- Gunakan Bahasa Indonesia untuk penjelasan, dokumentasi internal, dan diskusi dengan pengguna.
- Gunakan istilah teknis bahasa Inggris jika lebih umum dipakai di ekosistem Next.js/React, tetapi jelaskan konteksnya bila perlu.
- Prioritaskan solusi yang jelas, maintainable, dan mudah dikembangkan oleh developer lain.

## Tech Stack

- Framework: Next.js App Router.
- Bahasa: TypeScript.
- Validasi: Zod sebagai single source of truth untuk schema validasi input.
- ORM: PrismaJS.
- Database/Auth/Storage: Supabase.
- Styling: Tailwind CSS.
- UI public pages: Flowbite.
- UI dashboard admin: shadcn/ui.

## Catatan Penting Next.js

Ikuti instruksi dari `AGENTS.md`: versi Next.js pada proyek ini memiliki breaking changes. Sebelum menulis atau mengubah kode Next.js, baca dokumentasi relevan di `node_modules/next/dist/docs/` dan perhatikan deprecation notice.

## Struktur Project yang Diinginkan

```text
/
├── app/                  # Routing, pages, layouts; Server Components by default
│   ├── (auth)/           # Route group auth seperti login/register
│   ├── dashboard/        # Dashboard admin routes
│   ├── api/              # Route Handlers hanya untuk webhook/public API bila dibutuhkan
│   ├── layout.tsx
│   └── page.tsx
├── actions/              # Server Actions untuk mutasi data dan business logic
├── components/           # Reusable UI components
│   ├── ui/               # Base UI components shadcn/ui
│   ├── public/           # Komponen public page berbasis Flowbite
│   └── forms/            # Komponen form spesifik
├── lib/                  # Singleton, konfigurasi, dan utility functions
│   ├── prisma.ts
│   ├── supabase.ts
│   └── utils.ts
├── schemas/              # Zod validation schemas
├── services/             # Data Access Layer untuk query GET/read-only
├── prisma/               # Prisma schema, migrations, seed
└── docs/                 # Dokumentasi project, spec, dan task plan
```

## Code Pattern dan Boundary

- Gunakan Server Components secara default untuk halaman dan layout.
- Gunakan Client Components hanya jika membutuhkan interaksi browser seperti state lokal, event handler, modal interaktif, carousel client-side, atau form dinamis.
- Mutasi data dilakukan lewat Server Actions di folder `actions/`.
- Query/read-only data diletakkan di folder `services/`.
- Validasi input wajib menggunakan Zod schema di folder `schemas/`.
- Prisma client singleton diletakkan di `lib/prisma.ts`.
- Supabase client/helper diletakkan di `lib/supabase.ts` atau file turunan sesuai kebutuhan server/client.
- Jangan menaruh business logic berat langsung di komponen UI.
- Hindari duplikasi schema antara frontend dan backend; gunakan Zod sebagai sumber validasi utama.

## UI Guidelines

### Public Pages

- Gunakan Flowbite untuk komponen publik seperti navbar, carousel, card, table, accordion, badge, footer, dan form sederhana.
- Public pages harus ringan, responsif, mudah dibaca, dan cocok untuk pengunjung umum paroki.
- Prioritaskan akses cepat ke jadwal misa, kalender pelayanan, kegiatan mendatang, pengumuman, profil paroki, informasi sakramen, dan kontak.

### Dashboard Admin

- Gunakan shadcn/ui untuk dashboard admin.
- Dashboard harus fokus pada efisiensi input data dan pengelolaan konten.
- Gunakan table, dialog/form, select, badge, toast, dan confirmation dialog untuk CRUD.
- Semua route dashboard harus diproteksi dengan Supabase Auth.

## Fitur Utama

### Public Website

- Landing/Home Page dengan section utama:
  1. Header/navbar.
  2. Hero slider/carousel gambar.
  3. Jadwal misa ringkas.
  4. Cuplikan kalender pelayanan.
  5. 5 kegiatan mendatang.
  6. Pengumuman singkat.
  7. Sambutan/profil singkat pastor atau paroki.
  8. Footer dengan kontak dan peta.
- Halaman Kalender/Jadwal Pelayanan.
- Halaman Profil Paroki.
- Halaman Informasi Sakramen.
- Halaman Hubungi Kami/Kontak.
- Halaman Pengumuman Singkat.

### Kalender Jadwal Pelayanan

- Kalender adalah fitur utama website.
- Gunakan pendekatan data relasional penuh.
- Jadwal menampilkan informasi menengah: nama kegiatan/misa, waktu, lokasi, dan petugas/pelayan terkait.
- Data petugas/pelayan dikelola sebagai entitas terpisah agar tidak terjadi duplikasi nama dan agar mudah dicari.

### Fitur Dashboard Admin

- Login/logout admin menggunakan Supabase Auth.
- CRUD jadwal pelayanan.
- CRUD petugas/pelayan.
- CRUD role pelayanan, misalnya Romo, Lektor, Prodiakon, Pemazmur, Misdinar.
- CRUD kegiatan mendatang.
- CRUD pengumuman singkat.
- Pengaturan informasi website seperti alamat, kontak, sosial media, dan peta.

## Data Model Awal

Gunakan model relasional sebagai dasar:

- `ServiceRole`: role pelayanan seperti Romo, Lektor, Prodiakon, Pemazmur, Misdinar.
- `Person`: data petugas/pelayan.
- `Schedule`: data jadwal misa/kegiatan pelayanan.
- `ScheduleAssignment`: relasi antara jadwal, petugas, dan role pelayanan.
- `Event`: kegiatan mendatang untuk section "5 Kegiatan Mendatang".
- `Announcement`: pengumuman singkat.
- `SiteSetting`: informasi umum website seperti alamat, kontak, sosial media, dan peta.

## List Task Pembangunan Website dari Awal Sampai Selesai

### Phase 0 — Discovery dan Specification

- [x] Finalisasi kebutuhan fitur dan scope rilis pertama.
- [x] Review website referensi dan ambil pola yang relevan untuk landing page.
- [x] Buat design spec project di `docs/superpowers/specs/`.
- [x] Buat implementation plan yang memecah pekerjaan menjadi task teknis.

### Phase 1 — Project Foundation

- [x] Review dokumentasi Next.js lokal sesuai instruksi `AGENTS.md`.
- [x] Rapikan metadata awal website di `app/layout.tsx`.
- [x] Siapkan struktur folder `actions/`, `components/`, `lib/`, `schemas/`, `services/`, dan `docs/`.
- [x] Install dan konfigurasi dependency: Prisma, Supabase, Zod, Flowbite, shadcn/ui, dan dependency pendukung.
- [x] Konfigurasi environment variables untuk Supabase dan database.
- [x] Siapkan Prisma client singleton.
- [x] Siapkan Supabase server/client helper sesuai kebutuhan Next.js App Router.

### Phase 2 — Database dan Validation Layer

- [ ] Definisikan schema Prisma untuk `ServiceRole`, `Person`, `Schedule`, `ScheduleAssignment`, `Event`, `Announcement`, dan `SiteSetting`.
- [ ] Buat migration awal Prisma.
- [ ] Buat seed data awal untuk role pelayanan, contoh petugas, jadwal, kegiatan, dan pengumuman.
- [ ] Buat Zod schema untuk jadwal, petugas, role, kegiatan, pengumuman, dan pengaturan website.
- [ ] Buat service layer untuk query data publik dan admin.

### Phase 3 — Authentication dan Admin Layout

- [ ] Implementasi Supabase Auth untuk login/logout admin.
- [ ] Buat route group auth untuk halaman login.
- [ ] Buat protected dashboard layout.
- [ ] Tambahkan sidebar/topbar dashboard admin.
- [ ] Tambahkan guard agar halaman dashboard hanya bisa diakses admin terautentikasi.

### Phase 4 — Admin CRUD Core

- [ ] Buat CRUD role pelayanan.
- [ ] Buat CRUD petugas/pelayan.
- [ ] Buat CRUD jadwal pelayanan dengan assignment petugas berdasarkan role.
- [ ] Buat CRUD kegiatan mendatang.
- [ ] Buat CRUD pengumuman singkat.
- [ ] Buat pengaturan informasi website: alamat, kontak, peta, sosial media.
- [ ] Tambahkan validasi form, loading state, empty state, error state, dan confirmation dialog.

### Phase 5 — Public Layout dan Home Page

- [ ] Buat public navbar menggunakan Flowbite.
- [ ] Buat hero carousel/slider gambar.
- [ ] Buat section jadwal misa ringkas.
- [ ] Buat section cuplikan kalender pelayanan.
- [ ] Buat section 5 kegiatan mendatang.
- [ ] Buat section pengumuman singkat.
- [ ] Buat section profil/sambutan singkat.
- [ ] Buat footer dengan kontak, sosial media, dan peta.
- [ ] Pastikan home page responsif di mobile, tablet, dan desktop.

### Phase 6 — Public Pages

- [ ] Buat halaman kalender/jadwal pelayanan lengkap.
- [ ] Buat halaman detail jadwal bila diperlukan.
- [ ] Buat halaman profil paroki.
- [ ] Buat halaman informasi sakramen.
- [ ] Buat halaman hubungi kami/kontak.
- [ ] Buat halaman daftar pengumuman.
- [ ] Buat halaman daftar/detail kegiatan jika dibutuhkan.

### Phase 7 — Quality, Testing, dan Verification

- [ ] Jalankan lint dan type check.
- [ ] Uji flow public pages secara manual.
- [ ] Uji login admin dan semua CRUD utama.
- [ ] Uji relasi jadwal-petugas-role pada kalender pelayanan.
- [ ] Uji responsive layout untuk public pages dan dashboard.
- [ ] Tambahkan test dasar untuk schema Zod dan service penting bila diperlukan.
- [ ] Perbaiki bug dan edge case yang ditemukan.

### Phase 8 — Content, SEO, dan Deployment

- [ ] Isi konten awal: profil paroki, sakramen, kontak, kegiatan, pengumuman, dan jadwal.
- [ ] Tambahkan metadata SEO untuk halaman utama dan halaman publik penting.
- [ ] Siapkan favicon/logo dan asset gambar paroki.
- [ ] Konfigurasi deployment environment variables.
- [ ] Deploy ke platform target.
- [ ] Lakukan smoke test setelah deploy.

## Verification Commands

Gunakan command sesuai package manager project:

```bash
npm run lint
npm run build
```

Jika test sudah ditambahkan:

```bash
npm run test
```

## Prinsip Pengerjaan

- Kerjakan secara bertahap berdasarkan phase dan task list.
- Jangan langsung membuat semua fitur besar sekaligus tanpa spec dan implementation plan.
- Untuk setiap perubahan besar, jelaskan file yang diubah dan alasan perubahannya.
- Setelah implementasi, selalu verifikasi dengan lint/build/test atau pengecekan manual yang relevan.
