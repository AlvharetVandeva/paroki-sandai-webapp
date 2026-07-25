### Task 2: Zod Schema — Validation Layer

**Files:**
- Create: `schemas/organization.schema.ts`

**Interfaces:**
- Produces: `OrganizationMemberSchema` (Zod object), `OrganizationMemberInput` type

- [ ] **Step 1: Buat schema validasi**

Buat file `schemas/organization.schema.ts`:

```typescript
import { z } from "zod";

export const OrganizationMemberSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  position: z
    .string()
    .min(2, "Jabatan minimal 2 karakter")
    .max(100, "Jabatan maksimal 100 karakter"),
  photo: z
    .string()
    .url("URL foto tidak valid")
    .optional()
    .or(z.literal("")),
  orderIndex: z.coerce.number().int().min(0).default(0),
});

export const OrganizationMemberUpdateSchema = OrganizationMemberSchema.partial();

export type OrganizationMemberInput = z.infer<typeof OrganizationMemberSchema>;
export type OrganizationMemberUpdate = z.infer<typeof OrganizationMemberUpdateSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add schemas/organization.schema.ts
git commit -m "feat: add Zod schema for OrganizationMember

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

