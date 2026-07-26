import prisma from "@/lib/prisma";

export async function getParishCenter() {
  return prisma.parishCenter.findFirst();
}

export async function getStations() {
  return prisma.station.findMany({
    orderBy: { orderIndex: "asc" },
  });
}
