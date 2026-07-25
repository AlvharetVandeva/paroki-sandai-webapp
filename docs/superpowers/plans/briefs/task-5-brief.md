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

