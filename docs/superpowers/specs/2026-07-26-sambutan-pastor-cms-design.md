# Design Spec: CMS Sambutan Pastor

**Tanggal**: 2026-07-26
**Status**: Draft
**Fitur**: Mengubah section Sambutan Pastor dari hardcoded menjadi dikelola lewat CMS.

---

## Ringkasan

Section `PastorGreetingSection` di halaman beranda saat ini hardcoded: foto path statis, teks kutipan statis, nama dan jabatan statis. Diubah agar admin dapat mengedit: foto pastor, teks sambutan, nama pastor, dan jabatan lewat CMS di `/dashboard/profil`.

Format visual section tetap sama seperti sekarang: foto di kiri, kutipan di kanan, nama + jabatan di bawah kutipan.

---

## Data Model

4 SiteSetting key baru (tidak ada model Prisma baru):

| Key | Value | Deskripsi |
|-----|-------|-----------|
| `pastorPhoto` | URL (string) | Foto pastor |
| `pastorGreeting` | Text (string) | Teks sambutan |
| `pastorName` | String | Nama pastor |
| `pastorTitle` | String | Jabatan (contoh: "Pastor Paroki Sandai") |

Alasan: satu pastor saja, tidak perlu model terpisah. Konsisten dengan `profileVideoUrl`, `organizationChartImage`, dan statistik.

---

## Public Page — Beranda

### File Diubah

- `components/public/home-sections.tsx` — `PastorGreetingSection` terima props dari server, bukan hardcoded
- `app/(public)/page.tsx` — fetch 4 SiteSetting key, teruskan ke `PastorGreetingSection`

### Perubahan `PastorGreetingSection`

Dari:
```tsx
export function PastorGreetingSection() {
  // hardcoded values
}
```

Menjadi:
```tsx
export function PastorGreetingSection({
  photo,
  greeting,
  name,
  title,
}: {
  photo: string | null;
  greeting: string | null;
  name: string | null;
  title: string | null;
}) {
  // semua data dari CMS, fallback ke default jika null
}
```

### State Handling

- Semua null → section tidak dirender
- Foto null → tampilkan placeholder (inisial atau ikon)
- Greeting null → fallback teks default pendek
- Name null → fallback "Pastor Paroki"
- Title null → fallback "Paroki Sandai"

---

## Dashboard CMS — `/dashboard/profil`

Tab ke-5: "Sambutan Pastor"

### Layout Tab

```
┌─────────────────────────────────────────┐
│  Card: Sambutan Pastor                   │
│  Deskripsi: Data ditampilkan di halaman  │
│  beranda pada section Sambutan Pastor.   │
│                                          │
│  Foto Pastor:   [Upload / Preview]       │
│  Nama Pastor:   [              ]         │
│  Jabatan:       [              ]         │
│  Sambutan:      [  textarea     ]        │
│                                          │
│  [Simpan Sambutan]                       │
└─────────────────────────────────────────┘
```

- Upload foto via `/api/upload` dengan preview
- Input text untuk nama dan jabatan
- Textarea untuk teks sambutan
- Tombol "Simpan Sambutan"

### File Baru

| File | Deskripsi |
|------|-----------|
| `actions/pastor-greeting.action.ts` | `savePastorGreeting(data)` — upsert 4 SiteSetting key |

### File Diubah

| File | Deskripsi |
|------|-----------|
| `app/dashboard/profil/page.tsx` | Load 4 pastor greeting values + pass ke client |
| `app/dashboard/profil/profil-client.tsx` | Tambah tab "Sambutan Pastor" |
| `app/(public)/page.tsx` | Fetch 4 key, teruskan ke PastorGreetingSection |
| `components/public/home-sections.tsx` | Ubah PastorGreetingSection terima props |

---

## Server Action

```ts
// actions/pastor-greeting.action.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function savePastorGreeting(data: {
  photo: string;
  greeting: string;
  name: string;
  title: string;
}) {
  try {
    const entries = [
      { key: "pastorPhoto", value: data.photo },
      { key: "pastorGreeting", value: data.greeting },
      { key: "pastorName", value: data.name },
      { key: "pastorTitle", value: data.title },
    ];
    for (const e of entries) {
      await prisma.siteSetting.upsert({
        where: { key: e.key },
        update: { value: e.value },
        create: { key: e.key, value: e.value },
      });
    }
    revalidatePath("/dashboard/profil");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan sambutan pastor" };
  }
}
```

---

## Verification

```bash
npm run lint
npm run build
```
