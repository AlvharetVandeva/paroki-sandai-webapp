"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function saveOrganizationChart(url: string) {
  try {
    await prisma.siteSetting.upsert({
      where: { key: "organizationChartImage" },
      update: { value: url },
      create: { key: "organizationChartImage", value: url },
    });
    revalidatePath("/dashboard/profil");
    revalidatePath("/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan bagan organisasi" };
  }
}

export async function removeOrganizationChart() {
  try {
    await prisma.siteSetting.delete({ where: { key: "organizationChartImage" } });
    revalidatePath("/dashboard/profil");
    revalidatePath("/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus bagan organisasi" };
  }
}

export async function saveProfileVideo(url: string) {
  try {
    await prisma.siteSetting.upsert({
      where: { key: "profileVideoUrl" },
      update: { value: url },
      create: { key: "profileVideoUrl", value: url },
    });
    revalidatePath("/dashboard/profil");
    revalidatePath("/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan URL video" };
  }
}
