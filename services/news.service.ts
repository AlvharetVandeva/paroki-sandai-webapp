import prisma from "@/lib/prisma";

export async function getAllNews() {
  return prisma.news.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, image: true } } },
  });
}

export async function getNewsById(id: number) {
  return prisma.news.findUnique({
    where: { id },
    include: { 
      author: { select: { name: true, image: true } },
      images: true,
    },
  });
}

export async function getNewsBySlug(slug: string) {
  return prisma.news.findUnique({
    where: { slug },
    include: { author: { select: { name: true, image: true } } },
  });
}

export async function getPublishedNews(limit?: number) {
  return prisma.news.findMany({
    where: { publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { name: true, image: true } } },
    ...(limit ? { take: limit } : {}),
  });
}
