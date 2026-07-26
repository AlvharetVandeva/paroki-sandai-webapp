import { z } from "zod";

export const ParishCenterSchema = z.object({
  name: z
    .string()
    .min(2, "Nama paroki minimal 2 karakter")
    .max(100, "Nama paroki maksimal 100 karakter"),
  patron: z
    .string()
    .min(2, "Nama pelindung minimal 2 karakter")
    .max(100, "Nama pelindung maksimal 100 karakter"),
});

export type ParishCenterInput = z.infer<typeof ParishCenterSchema>;
