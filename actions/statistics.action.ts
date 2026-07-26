"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function saveStatistics(data: {
  jiwa: string;
  kk: string;
  tahunPelayanan: string;
}) {
  try {
    const entries: { key: string; value: string }[] = [
      { key: "statJiwa", value: data.jiwa },
      { key: "statKK", value: data.kk },
      { key: "statTahunPelayanan", value: data.tahunPelayanan },
    ];

    for (const entry of entries) {
      await prisma.siteSetting.upsert({
        where: { key: entry.key },
        update: { value: entry.value },
        create: { key: entry.key, value: entry.value },
      });
    }

    revalidatePath("/dashboard/profil");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan statistik" };
  }
}
