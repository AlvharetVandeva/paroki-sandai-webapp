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
