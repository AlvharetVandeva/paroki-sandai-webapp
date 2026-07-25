### Task 3: Service Layer — Public Read Queries

**Files:**
- Create: `services/organization.service.ts`

**Interfaces:**
- Produces: `getAllMembers()` → `Promise<OrganizationMember[]>` (ordered by `orderIndex asc`)

- [ ] **Step 1: Buat service untuk query publik**

Buat file `services/organization.service.ts`:

```typescript
import prisma from "@/lib/prisma";

export async function getAllMembers() {
  return prisma.organizationMember.findMany({
    orderBy: { orderIndex: "asc" },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add services/organization.service.ts
git commit -m "feat: add service layer for OrganizationMember queries

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

