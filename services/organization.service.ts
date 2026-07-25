import prisma from "@/lib/prisma";

export async function getAllMembers() {
  return prisma.organizationMember.findMany({
    orderBy: { orderIndex: "asc" },
  });
}
