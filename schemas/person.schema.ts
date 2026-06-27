import { z } from "zod";

export const PersonSchema = z.object({
  fullName: z
    .string()
    .min(3, "Nama lengkap minimal 3 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  roleId: z.number().int().positive("Role harus dipilih").optional().nullable(),
});

export const PersonUpdateSchema = PersonSchema.partial();

export type PersonInput = z.infer<typeof PersonSchema>;
export type PersonUpdate = z.infer<typeof PersonUpdateSchema>;
