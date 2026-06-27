"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { ServiceRoleSchema, ServiceRoleUpdateSchema } from "@/schemas/service-role.schema";

export async function createRole(data: { name: string; description?: string }) {
  const parsed = ServiceRoleSchema.parse(data);
  await prisma.serviceRole.create({ data: parsed });
  revalidatePath("/dashboard/roles");
}

export async function updateRole(id: number, data: { name?: string; description?: string }) {
  const parsed = ServiceRoleUpdateSchema.parse(data);
  await prisma.serviceRole.update({ where: { id }, data: parsed });
  revalidatePath("/dashboard/roles");
}

export async function deleteRole(id: number) {
  await prisma.serviceRole.delete({ where: { id } });
  revalidatePath("/dashboard/roles");
}
