import { z } from "zod";

export const EventSchema = z.object({
  title: z
    .string()
    .min(3, "Judul kegiatan minimal 3 karakter")
    .max(200, "Judul kegiatan maksimal 200 karakter"),
  description: z.string().optional(),
  date: z.coerce.date({ message: "Tanggal kegiatan harus diisi" }),
  imageUrl: z.string().url("URL gambar tidak valid").optional().or(z.literal("")),
  location: z.string().max(200).optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  address: z.string().optional().nullable(),
});

export const EventUpdateSchema = EventSchema.partial();

export type EventInput = z.infer<typeof EventSchema>;
export type EventUpdate = z.infer<typeof EventUpdateSchema>;
