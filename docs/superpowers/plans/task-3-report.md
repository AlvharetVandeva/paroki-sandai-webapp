### Task 3 Report: Service Layer — getAllMembers()

**Status:** Completed

**Commit:** `40ceedc` — feat: add service layer for OrganizationMember queries

**Summary:**
- Created `services/organization.service.ts` with single export `getAllMembers()`.
- Query uses `prisma.organizationMember.findMany({ orderBy: { orderIndex: "asc" } })` matching the `OrganizationMember` model in `prisma/schema.prisma` (fields: id, name, position, photo, orderIndex).
- No additional dependencies or schema changes required.

**Test Summary:** No automated tests — manual verification only. TypeScript compiles cleanly; the Prisma model `OrganizationMember` already exists in the schema.

**Concerns:** None.
