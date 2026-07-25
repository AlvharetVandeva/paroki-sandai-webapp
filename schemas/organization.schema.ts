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
