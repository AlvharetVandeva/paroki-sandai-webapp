"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function savePastorGreeting(data: {
  photo: string;
  greeting: string;
  name: string;
  title: string;
}) {
  try {
    const entries = [
      { key: "pastorPhoto", value: data.photo },
      { key: "pastorGreeting", value: data.greeting },
      { key: "pastorName", value: data.name },
      { key: "pastorTitle", value: data.title },
    ];

    for (const e of entries) {
      await prisma.siteSetting.upsert({
        where: { key: e.key },
        update: { value: e.value },
        create: { key: e.key, value: e.value },
      });
    }

    revalidatePath("/dashboard/profil");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan sambutan pastor" };
  }
}
