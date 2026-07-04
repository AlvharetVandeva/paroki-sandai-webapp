"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { GallerySchema, GalleryInput } from "@/schemas/gallery.schema";

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") + "-" + Date.now();
}

export async function createGallery(data: GalleryInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Akses ditolak");

    const { images, ...parsed } = GallerySchema.parse(data);
    const slug = generateSlug(parsed.title);

    const gallery = await prisma.gallery.create({
      data: {
        ...parsed,
        slug,
        ...(images && images.length > 0 && {
          images: {
            create: images.map((url: string) => ({ url })),
          },
        }),
      },
    });

    revalidatePath("/dashboard/gallery");
    return { success: true, data: gallery };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal membuat album galeri" };
  }
}

export async function updateGallery(id: number, data: GalleryInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Akses ditolak");

    const { images, ...parsed } = GallerySchema.parse(data);

    // Get current gallery
    const current = await prisma.gallery.findUnique({ where: { id } });
    if (!current) throw new Error("Album galeri tidak ditemukan");

    // Only update slug if title changed
    let slug = current.slug;
    if (current.title !== parsed.title) {
      slug = generateSlug(parsed.title);
    }

    const gallery = await prisma.gallery.update({
      where: { id },
      data: {
        ...parsed,
        slug,
        ...(images && {
          images: {
            deleteMany: {}, // Delete all existing
            create: images.map((url: string) => ({ url })), // Recreate
          },
        }),
      },
    });

    revalidatePath("/dashboard/gallery");
    revalidatePath(`/dashboard/gallery/${id}`);
    return { success: true, data: gallery };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui album galeri" };
  }
}

export async function deleteGallery(id: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Akses ditolak");

    await prisma.gallery.delete({
      where: { id },
    });

    revalidatePath("/dashboard/gallery");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus album galeri" };
  }
}
