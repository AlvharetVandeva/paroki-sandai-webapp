# Design Spec: Section Statistik Beranda

**Tanggal**: 2026-07-26
**Status**: Draft
**Fitur**: Menambahkan section statistik di halaman beranda dengan animasi count-up dan CMS di dashboard profil paroki.

---

## Ringkasan

Menampilkan tiga metrik statistik di halaman beranda:
- **Jiwa Penduduk** — total jiwa (angka)
- **Kepala Keluarga** — total KK (angka)
- **Tahun Pelayanan** — jumlah tahun melayani (angka, opsional)

Section ditempatkan setelah `SchedulePreviewSection`, sebelum `CalendarSection`. CMS berupa tab ke-4 di `/dashboard/profil`.

---

## Data Model

### SiteSetting Keys Baru

Tidak ada model Prisma baru. Semua data disimpan sebagai `SiteSetting`:

| Key | Value | Default | Deskripsi |
|-----|-------|---------|-----------|
| `statJiwa` | string (int) | `"0"` | Total jiwa penduduk |
| `statKK` | string (int) | `"0"` | Total kepala keluarga |
| `statTahunPelayanan` | string (int) | `""` | Jumlah tahun melayani, kosong = tidak ditampilkan |

Alasan: hanya 3 field angka, tidak perlu model Prisma terpisah. Konsisten dengan `profileVideoUrl` dan `organizationChartImage`.

---

## Public Page — Beranda

### Penempatan

Di `app/(public)/page.tsx`:

```
HeroCarousel
SchedulePreviewSection
StatisticsSection          ← BARU, di sini
CalendarSection
EventsSection
...
```

### Komponen Baru

| File | Tipe | Deskripsi |
|------|------|-----------|
| `components/public/statistics-counter.tsx` | Client | Count-up animasi dengan IntersectionObserver |

### Visual

- Background: `bg-blue-600` (warna paroki), teks putih
- 3 kolom desktop, 1 kolom mobile (stack vertikal)
- Setiap metrik: angka besar (text-4xl, font-bold) di atas, label kecil di bawah
- Tahun Pelayanan: seluruh kolom tidak dirender jika nilai kosong

### Animasi Count-Up

- `IntersectionObserver` — trigger animasi saat section masuk viewport
- Animasi hanya jalan sekali (`hasAnimated` flag)
- Easing: `easeOutCubic` selama ~2 detik
- Teknik: `requestAnimationFrame` loop, interpolasi dari 0 ke target, update DOM via `textContent` (bukan React state) untuk performa
- Setelah animasi selesai, set angka final via state

### State Handling

- Semua nilai 0 → section tetap dirender
- Tahun Pelayanan kosong → kolom tidak dirender
- Section tidak dirender hanya jika ketiga nilai semuanya kosong/null (opsional, fallback)

### Data Flow

```
page.tsx (Server Component)
  getSetting("statJiwa")           ──┐
  getSetting("statKK")             ──┼──► StatisticsCounter  ──► animasi count-up
  getSetting("statTahunPelayanan") ──┘
```

---

## Dashboard CMS — `/dashboard/profil`

Tab ke-4: "Statistik"

### Layout Tab

```
┌─────────────────────────────────────────┐
│  Card: Statistik Paroki                  │
│  Deskripsi: Data statistik ditampilkan   │
│  di halaman beranda dengan animasi.     │
│                                          │
│  Jiwa Penduduk:  [    1250    ]          │
│  Kepala Keluarga: [    420     ]         │
│  Tahun Pelayanan: [    30      ]         │
│  (kosongkan jika tidak ingin ditampilkan)│
│                                          │
│  [Simpan Statistik]                      │
└─────────────────────────────────────────┘
```

- 3 input type="number", min="0"
- Tahun Pelayanan ada hint: "Kosongkan jika tidak ingin ditampilkan"
- Tombol simpan → `saveStatistics()` server action
- Load nilai yang sudah tersimpan saat halaman dibuka

### File Baru

| File | Deskripsi |
|------|-----------|
| `actions/statistics.action.ts` | `saveStatistics(jiwa, kk, tahunPelayanan)` |

### File Diubah

| File | Deskripsi |
|------|-----------|
| `app/dashboard/profil/page.tsx` | Load 3 nilai statistik + pass ke client |
| `app/dashboard/profil/profil-client.tsx` | Tambah tab "Statistik" |
| `app/(public)/page.tsx` | Tambah `StatisticsSection` di antara `SchedulePreviewSection` dan `CalendarSection` |

---

## File Tree — Semua File Terdampak

```
├── app/
│   ├── (public)/
│   │   └── page.tsx                          # UPDATE: tambah StatisticsSection
│   └── dashboard/profil/
│       ├── page.tsx                          # UPDATE: load statistik values
│       └── profil-client.tsx                 # UPDATE: tambah tab Statistik
├── components/public/
│   └── statistics-counter.tsx                # NEW: count-up animation
└── actions/
    └── statistics.action.ts                  # NEW: saveStatistics server action
```

---

## Verification

```bash
npx prisma generate
npm run lint
npm run build
```
