### Task 4: Server Actions — CRUD OrganizationMember + SiteSetting

**Files:**
- Create: `actions/organization.action.ts`

**Interfaces:**
- Consumes: `OrganizationMemberSchema` from `schemas/organization.schema.ts`
- Produces:
  - `createMember(data: OrganizationMemberInput)` → `Promise<{ success: boolean; error?: string }>`
  - `updateMember(id: number, data: OrganizationMemberUpdate)` → `Promise<{ success: boolean; error?: string }>`
  - `deleteMember(id: number)` → `Promise<{ success: boolean; error?: string }>`
  - `saveProfileVideo(url: string)` → `Promise<{ success: boolean; error?: string }>`

- [ ] **Step 1: Buat Server Actions**

Buat file `actions/organization.action.ts`:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  OrganizationMemberSchema,
  OrganizationMemberUpdateSchema,
} from "@/schemas/organization.schema";

export async function createMember(data: Record<string, unknown>) {
  try {
    const parsed = OrganizationMemberSchema.parse(data);
    await prisma.organizationMember.create({ data: parsed });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menambah anggota" };
  }
}

export async function updateMember(id: number, data: Record<string, unknown>) {
  try {
    const parsed = OrganizationMemberUpdateSchema.parse(data);
    await prisma.organizationMember.update({
      where: { id },
      data: parsed,
    });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengubah anggota" };
  }
}

export async function deleteMember(id: number) {
  try {
    await prisma.organizationMember.delete({ where: { id } });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus anggota" };
  }
}

export async function saveProfileVideo(url: string) {
  try {
    await prisma.siteSetting.upsert({
      where: { key: "profileVideoUrl" },
      update: { value: url },
      create: { key: "profileVideoUrl", value: url },
    });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan URL video" };
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add actions/organization.action.ts
git commit -m "feat: add Server Actions for OrganizationMember CRUD + profile video

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

