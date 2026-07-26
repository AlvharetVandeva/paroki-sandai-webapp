import { z } from "zod";

export const StationSchema = z.object({
  name: z
    .string()
    .min(2, "Nama stasi minimal 2 karakter")
    .max(100, "Nama stasi maksimal 100 karakter"),
  patron: z
    .string()
    .min(2, "Nama pelindung minimal 2 karakter")
    .max(100, "Nama pelindung maksimal 100 karakter"),
  address: z.string().nullable().optional(),
  orderIndex: z.number().int().min(0).default(0),
});

export const StationUpdateSchema = StationSchema.partial();

export type StationInput = z.infer<typeof StationSchema>;
export type StationUpdate = z.infer<typeof StationUpdateSchema>;
