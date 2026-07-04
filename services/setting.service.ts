import prisma from "@/lib/prisma";

export async function getSiteSetting(key: string) {
  const setting = await prisma.siteSetting.findUnique({
    where: { key },
  });
  return setting?.value || null;
}
