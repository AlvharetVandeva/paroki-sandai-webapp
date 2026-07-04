"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function saveSiteSetting(key: string, value: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Akses ditolak");

    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    revalidatePath("/dashboard/history");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan pengaturan" };
  }
}
