import prisma from "@/lib/prisma";

export async function getAllGalleries() {
  return prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: true },
  });
}

export async function getGalleryById(id: number) {
  return prisma.gallery.findUnique({
    where: { id },
    include: { images: true },
  });
}

export async function getGalleryBySlug(slug: string) {
  return prisma.gallery.findUnique({
    where: { slug },
    include: { images: true },
  });
}
