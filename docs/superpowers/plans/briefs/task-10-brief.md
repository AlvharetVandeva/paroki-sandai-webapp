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
