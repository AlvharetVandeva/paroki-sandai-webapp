"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { ParishCenterSchema } from "@/schemas/parish-center.schema";

export async function saveParishCenter(data: Record<string, unknown>) {
  try {
    const parsed = ParishCenterSchema.parse(data);
    const existing = await prisma.parishCenter.findFirst();
    if (existing) {
      await prisma.parishCenter.update({
        where: { id: existing.id },
        data: parsed,
      });
    } else {
      await prisma.parishCenter.create({ data: parsed });
    }
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan pusat paroki" };
  }
}
