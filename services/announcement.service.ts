import prisma from "@/lib/prisma";

export async function getAllAnnouncements() {
  return prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getAnnouncementById(id: number) {
  return prisma.announcement.findUnique({ where: { id } });
}

export async function getRecentAnnouncements(limit = 4) {
  return prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAnnouncementsPage({
  page = 1,
  pageSize = 10,
  sort = "desc",
  query = "",
}: {
  page?: number;
  pageSize?: number;
  sort?: "asc" | "desc";
  query?: string;
}) {
  const skip = (page - 1) * pageSize;
  const where = query
    ? {
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { content: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: { createdAt: sort },
      skip,
      take: pageSize,
    }),
    prisma.announcement.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
