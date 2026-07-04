"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { AnnouncementSchema, AnnouncementUpdateSchema } from "@/schemas/announcement.schema";

export async function createAnnouncement(data: { title: string; content: string }) {
  try {
    const parsed = AnnouncementSchema.parse(data);
    const announcement = await prisma.announcement.create({ data: parsed });
    revalidatePath("/dashboard/announcements");
    return { success: true, data: announcement };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal membuat pengumuman" };
  }
}

export async function updateAnnouncement(id: number, data: { title?: string; content?: string }) {
  try {
    const parsed = AnnouncementUpdateSchema.parse(data);
    const announcement = await prisma.announcement.update({ where: { id }, data: parsed });
    revalidatePath("/dashboard/announcements");
    revalidatePath(`/dashboard/announcements/${id}`);
    return { success: true, data: announcement };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengubah pengumuman" };
  }
}

export async function deleteAnnouncement(id: number) {
  try {
    await prisma.announcement.delete({ where: { id } });
    revalidatePath("/dashboard/announcements");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus pengumuman" };
  }
}
