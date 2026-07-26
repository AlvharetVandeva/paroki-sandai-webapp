"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { NewsSchema, NewsUpdateSchema } from "@/schemas/news.schema";
import { auth } from "@/auth";

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4);
}

export async function createNews(data: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Anda harus login untuk membuat berita");

    const { images, ...parsed } = NewsSchema.parse(data);
    const slug = generateSlug(parsed.title);

    const news = await prisma.news.create({
      data: {
        ...parsed,
        slug,
        authorId: session.user.id,
        ...(images && images.length > 0 && {
          images: {
            create: images.map((url: string) => ({ url })),
          },
        }),
      },
    });

    revalidatePath("/dashboard/news");
    revalidatePath("/berita");
    revalidatePath("/", "layout");
    return { success: true, data: news };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal membuat berita" };
  }
}

export async function updateNews(id: number, data: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Anda harus login untuk mengubah berita");

    const { images, ...parsed } = NewsUpdateSchema.parse(data);
    let slug;
    if (parsed.title) {
      slug = generateSlug(parsed.title);
    }

    const news = await prisma.news.update({
      where: { id },
      data: {
        ...parsed,
        ...(slug && { slug }),
        ...(images !== undefined && {
          images: {
            deleteMany: {},
            create: images.map((url: string) => ({ url })),
          },
        }),
      },
    });

    revalidatePath("/dashboard/news");
    revalidatePath(`/dashboard/news/${id}`);
    revalidatePath("/berita");
    if (slug) revalidatePath(`/berita/${slug}`);
    revalidatePath("/", "layout");
    return { success: true, data: news };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengubah berita" };
  }
}

export async function deleteNews(id: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Akses ditolak");

    await prisma.news.delete({ where: { id } });
    revalidatePath("/dashboard/news");
    revalidatePath("/berita");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus berita" };
  }
}

export async function togglePublishStatus(id: number, publish: boolean) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Akses ditolak");

    await prisma.news.update({
      where: { id },
      data: {
        publishedAt: publish ? new Date() : null,
      },
    });
    revalidatePath("/dashboard/news");
    revalidatePath(`/dashboard/news/${id}`);
    revalidatePath("/berita");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengubah status publikasi" };
  }
}
