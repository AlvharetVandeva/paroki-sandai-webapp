"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { AnnouncementSchema, AnnouncementUpdateSchema } from "@/schemas/announcement.schema";

export async function createAnnouncement(data: { title: string; content: string }) {
  const parsed = AnnouncementSchema.parse(data);
  await prisma.announcement.create({ data: parsed });
  revalidatePath("/dashboard/announcements");
}

export async function updateAnnouncement(id: number, data: { title?: string; content?: string }) {
  const parsed = AnnouncementUpdateSchema.parse(data);
  await prisma.announcement.update({ where: { id }, data: parsed });
  revalidatePath("/dashboard/announcements");
}

export async function deleteAnnouncement(id: number) {
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/dashboard/announcements");
}
