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
    include: {
      author: { select: { name: true, image: true } },
      images: true,
    },
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

export async function getPublishedNewsPage({
  page = 1,
  pageSize = 9,
  query = "",
}: {
  page?: number;
  pageSize?: number;
  query?: string;
}) {
  const skip = (page - 1) * pageSize;
  const where = {
    publishedAt: { lte: new Date() },
    ...(query
      ? {
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.news.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
      include: { author: { select: { name: true, image: true } } },
    }),
    prisma.news.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
