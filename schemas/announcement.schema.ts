import { z } from "zod";

export const AnnouncementSchema = z.object({
  title: z
    .string()
    .min(3, "Judul pengumuman minimal 3 karakter")
    .max(200, "Judul pengumuman maksimal 200 karakter"),
  content: z
    .string()
    .min(10, "Isi pengumuman minimal 10 karakter")
    .max(5000, "Isi pengumuman maksimal 5000 karakter"),
});

export const AnnouncementUpdateSchema = AnnouncementSchema.partial();

export type AnnouncementInput = z.infer<typeof AnnouncementSchema>;
export type AnnouncementUpdate = z.infer<typeof AnnouncementUpdateSchema>;
