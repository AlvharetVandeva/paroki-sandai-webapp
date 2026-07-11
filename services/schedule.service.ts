import prisma from "@/lib/prisma";

export async function getAllSchedules() {
  return prisma.schedule.findMany({
    orderBy: { startAt: "asc" },
    include: {
      assignments: {
        include: {
          person: { include: { role: true } },
          role: true,
        },
      },
    },
  });
}

export async function getScheduleById(id: number) {
  return prisma.schedule.findUnique({
    where: { id },
    include: {
      assignments: {
        include: {
          person: { include: { role: true } },
          role: true,
        },
      },
    },
  });
}

export async function getUpcomingSchedules(limit = 5) {
  // Get start of today so schedules for today are still shown
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.schedule.findMany({
    where: { startAt: { gte: today } },
    orderBy: { startAt: "asc" },
    take: limit,
    include: {
      assignments: {
        include: { person: true, role: true },
      },
    },
  });
}

export async function getSchedulesByDateRange(from: Date, to: Date) {
  return prisma.schedule.findMany({
    where: {
      startAt: { gte: from },
      endAt: { lte: to },
    },
    orderBy: { startAt: "asc" },
    include: {
      assignments: {
        include: { person: true, role: true },
      },
    },
  });
}

export async function getScheduleCountThisMonth() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return prisma.schedule.count({
    where: {
      startAt: { gte: startOfMonth, lt: startOfNextMonth },
    },
  });
}
