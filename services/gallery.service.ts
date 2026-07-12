import prisma from "@/lib/prisma";

export async function getAllGalleries() {
  return prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { images: true } },
    },
  });
}

export async function getGalleryById(id: number) {
  return prisma.gallery.findUnique({
    where: { id },
    include: { images: { orderBy: { id: "asc" } } },
  });
}

export async function getGalleryBySlug(slug: string) {
  return prisma.gallery.findUnique({
    where: { slug },
    include: { images: { orderBy: { id: "asc" } } },
  });
}

export async function getRecentGalleries(limit = 3) {
  return prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      _count: { select: { images: true } },
    },
  });
}
