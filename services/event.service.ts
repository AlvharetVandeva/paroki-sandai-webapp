import prisma from "@/lib/prisma";

export async function getAllEvents() {
  return prisma.event.findMany({ orderBy: { date: "asc" } });
}

export async function getEventById(id: number) {
  return prisma.event.findUnique({ where: { id } });
}

export async function getUpcomingEvents(limit = 5) {
  return prisma.event.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: limit,
  });
}
