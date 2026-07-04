import { z } from "zod";

export const NewsSchema = z.object({
  title: z
    .string()
    .min(5, "Judul berita minimal 5 karakter")
    .max(250, "Judul berita maksimal 250 karakter"),
  content: z
    .string()
    .min(10, "Isi berita minimal 10 karakter"),
  coverImage: z.string().optional().or(z.literal("")),
  publishedAt: z.coerce.date().optional().nullable(),
  images: z.array(z.string()).optional(),
});

export const NewsUpdateSchema = NewsSchema.partial();

export type NewsInput = z.infer<typeof NewsSchema>;
export type NewsUpdate = z.infer<typeof NewsUpdateSchema>;
