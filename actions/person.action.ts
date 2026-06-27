"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { PersonSchema, PersonUpdateSchema } from "@/schemas/person.schema";

export async function createPerson(data: { fullName: string; email?: string; roleId?: number | null }) {
  const parsed = PersonSchema.parse(data);
  await prisma.person.create({ data: { ...parsed, roleId: parsed.roleId ?? undefined } });
  revalidatePath("/dashboard/persons");
}

export async function updatePerson(id: number, data: { fullName?: string; email?: string; roleId?: number | null }) {
  const parsed = PersonUpdateSchema.parse(data);
  await prisma.person.update({ where: { id }, data: { ...parsed, roleId: parsed.roleId ?? undefined } });
  revalidatePath("/dashboard/persons");
}

export async function deletePerson(id: number) {
  await prisma.person.delete({ where: { id } });
  revalidatePath("/dashboard/persons");
}
