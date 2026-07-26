"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  StationSchema,
  StationUpdateSchema,
} from "@/schemas/station.schema";

export async function createStation(data: Record<string, unknown>) {
  try {
    const parsed = StationSchema.parse(data);
    await prisma.station.create({ data: parsed });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menambah stasi" };
  }
}

export async function updateStation(id: number, data: Record<string, unknown>) {
  try {
    const parsed = StationUpdateSchema.parse(data);
    await prisma.station.update({
      where: { id },
      data: parsed,
    });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengubah stasi" };
  }
}

export async function deleteStation(id: number) {
  try {
    await prisma.station.delete({ where: { id } });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus stasi" };
  }
}
