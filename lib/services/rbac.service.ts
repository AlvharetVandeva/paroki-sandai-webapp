import prisma from "@/lib/prisma";

export async function getRoles() {
  return prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
}

export async function getRoleById(id: number) {
  return prisma.role.findUnique({
    where: { id },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });
}

export async function getPermissions() {
  return prisma.permission.findMany({
    orderBy: [
      { resource: "asc" },
      { action: "asc" },
    ],
  });
}

export async function getUsersWithRoles() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });
}
