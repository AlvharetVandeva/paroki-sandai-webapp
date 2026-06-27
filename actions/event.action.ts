"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { EventSchema, EventUpdateSchema } from "@/schemas/event.schema";

export async function createEvent(data: {
  title: string;
  description?: string;
  date: Date;
  imageUrl?: string;
}) {
  const parsed = EventSchema.parse(data);
  await prisma.event.create({ data: parsed });
  revalidatePath("/dashboard/events");
}

export async function updateEvent(id: number, data: {
  title?: string;
  description?: string;
  date?: Date;
  imageUrl?: string;
}) {
  const parsed = EventUpdateSchema.parse(data);
  await prisma.event.update({ where: { id }, data: parsed });
  revalidatePath("/dashboard/events");
}

export async function deleteEvent(id: number) {
  await prisma.event.delete({ where: { id } });
  revalidatePath("/dashboard/events");
}
