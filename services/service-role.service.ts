import prisma from "@/lib/prisma";

export async function getAllRoles() {
  return prisma.serviceRole.findMany({ orderBy: { name: "asc" } });
}

export async function getRoleById(id: number) {
  return prisma.serviceRole.findUnique({
    where: { id },
    include: { persons: true },
  });
}
