## Task 4: Server Actions — CRUD OrganizationMember + SiteSetting

**Status:** Completed

**Commits:**
- `feat: add Server Actions for OrganizationMember CRUD + profile video` (actions/organization.action.ts)

**Test Summary:**
- Created `actions/organization.action.ts` successfully.
- Actions rely on `schemas/organization.schema.ts` (which already exists).
- Actions rely on Prisma models (`organizationMember`, `siteSetting`) (which exist).
- Type check after `npx prisma generate` passes for `actions/organization.action.ts`.
- Code uses `revalidatePath` to clear cache after mutations.

**Concerns:**
- Pre-existing TypeScript errors in unrelated files (supabase/ssr, user role mismatch) but `organization.action.ts` is type-safe.