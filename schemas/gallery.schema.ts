import { z } from "zod";

export const GallerySchema = z.object({
  title: z
    .string()
    .min(3, "Judul album minimal 3 karakter")
    .max(100, "Judul album maksimal 100 karakter"),
  description: z.string().optional(),
  coverImage: z.string().optional().or(z.literal("")),
  images: z.array(z.string()).optional(),
});

export type GalleryInput = z.infer<typeof GallerySchema>;
