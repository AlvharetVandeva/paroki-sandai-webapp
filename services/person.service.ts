import prisma from "@/lib/prisma";

export async function getAllPersons() {
  return prisma.person.findMany({
    orderBy: { fullName: "asc" },
    include: { role: true },
  });
}

export async function getPersonById(id: number) {
  return prisma.person.findUnique({
    where: { id },
    include: { role: true, assignments: { include: { schedule: true, role: true } } },
  });
}

export async function getPersonsByRole(roleId: number) {
  return prisma.person.findMany({
    where: { roleId },
    orderBy: { fullName: "asc" },
  });
}
