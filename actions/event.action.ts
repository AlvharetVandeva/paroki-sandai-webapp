"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { EventSchema, EventUpdateSchema } from "@/schemas/event.schema";

export async function createEvent(data: Record<string, unknown>) {
  const parsed = EventSchema.parse(data);
  await prisma.event.create({ data: parsed });
  revalidatePath("/dashboard/events");
  revalidatePath("/kegiatan");
  revalidatePath("/", "layout");
}

export async function updateEvent(id: number, data: Record<string, unknown>) {
  const parsed = EventUpdateSchema.parse(data);
  await prisma.event.update({ where: { id }, data: parsed });
  revalidatePath("/dashboard/events");
  revalidatePath("/kegiatan");
  revalidatePath("/", "layout");
}

export async function deleteEvent(id: number) {
  await prisma.event.delete({ where: { id } });
  revalidatePath("/dashboard/events");
  revalidatePath("/kegiatan");
  revalidatePath("/", "layout");
}
