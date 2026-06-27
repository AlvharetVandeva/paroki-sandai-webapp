import { z } from "zod";

export const EventSchema = z.object({
  title: z
    .string()
    .min(3, "Judul kegiatan minimal 3 karakter")
    .max(200, "Judul kegiatan maksimal 200 karakter"),
  description: z.string().optional(),
  date: z.coerce.date({ message: "Tanggal kegiatan harus diisi" }),
  imageUrl: z.string().url("URL gambar tidak valid").optional().or(z.literal("")),
});

export const EventUpdateSchema = EventSchema.partial();

export type EventInput = z.infer<typeof EventSchema>;
export type EventUpdate = z.infer<typeof EventUpdateSchema>;
