"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { SiteSettingsBulkSchema } from "@/schemas/site-setting.schema";

export async function updateSettings(data: Record<string, string>) {
  const parsed = SiteSettingsBulkSchema.parse(data);

  for (const [key, value] of Object.entries(parsed)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  revalidatePath("/dashboard/settings");
}
