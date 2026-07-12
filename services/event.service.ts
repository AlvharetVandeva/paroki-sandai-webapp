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

export async function getEventsForMonth(year: number, month: number) {
  const startOfMonth = new Date(year, month, 1);
  const startOfNextMonth = new Date(year, month + 1, 1);

  return prisma.event.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
    },
    orderBy: { date: "asc" },
  });
}
