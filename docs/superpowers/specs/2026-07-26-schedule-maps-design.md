# Schedule Maps Integration — Design Spec

**Date:** 2026-07-26  
**Status:** Approved  
**Scope:** Tambah fitur maps (optional) di Jadwal — sama persis seperti di Kegiatan

## Problem

Schedule (Jadwal) hanya punya field `location` teks. Events (Kegiatan) sudah punya MapPicker + latitude/longitude + tombol "Buka di Google Maps" di halaman public. Schedule harus dapat fitur yang sama.

## Design

### Yang disentuh

| Area | Perubahan |
|---|---|
| Prisma Schema | Tambah `latitude Float?`, `longitude Float?`, `address String?` di model `Schedule` |
| Zod Schema | Tambah validasi optional `latitude`, `longitude`, `address` |
| Server Action | `createSchedule` / `updateSchedule` simpan field baru |
| Admin Form | Tambah MapPicker + read-only koordinat display |
| Public Calendar Modal | Tambah tombol "Lihat di Peta" jika koordinat ada |
| Public Jadwal Page | Update `mapSchedule` mapper untuk mengirim field baru |

### Data Model Change

```prisma
model Schedule {
  // ... existing fields unchanged ...
  latitude    Float?    // baru, optional
  longitude   Float?    // baru, optional
  address     String?   // baru, optional
}
```

### Yang tidak berubah

- Tidak ada halaman detail terpisah untuk jadwal (tetap pakai modal di kalender)
- Sidebar kalender tetap tampil teks lokasi saja
- MapPicker sudah ada di `@/components/map-picker` — tinggal pakai ulang

## Implementation Steps

1. **Prisma schema** — tambah 3 field ke model `Schedule`
2. **Migration** — `npx prisma migrate dev --name add_schedule_maps`
3. **Zod schema** — tambah `latitude: z.coerce.number()...`, `longitude`, `address` optional
4. **Server action** — `createSchedule` / `updateSchedule` handle field baru
5. **Admin form** — tambah MapPicker section (seperti EventForm)
6. **Calendar types** — `CalendarSchedule` tambah `latitude`, `longitude`, `address`
7. **Jadwal page mapper** — `mapSchedule` kirim field baru
8. **Calendar modal** — tambah tombol "Lihat di Peta" di detail schedule
