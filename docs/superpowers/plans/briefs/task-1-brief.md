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

