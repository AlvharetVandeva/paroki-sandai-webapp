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

