import prisma from "@/lib/prisma";

export async function getAllRoles() {
  return prisma.serviceRole.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { persons: true } } },
  });
}

export async function getRoleById(id: number) {
  return prisma.serviceRole.findUnique({
    where: { id },
    include: { persons: true },
  });
}
