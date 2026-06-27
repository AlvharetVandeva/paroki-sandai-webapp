import prisma from "@/lib/prisma";

export async function getAllSettings() {
  const rows = await prisma.siteSetting.findMany();
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}

export async function getSetting(key: string) {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function getPublicSettings() {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: [
      "siteName",
      "address",
      "phone",
      "email",
      "pastorGreeting",
      "pastorName",
      "socialMediaFacebook",
      "socialMediaInstagram",
      "socialMediaYoutube",
      "mapEmbedUrl",
    ] } },
  });
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}
