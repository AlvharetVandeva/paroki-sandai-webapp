import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getGalleryBySlug, getRecentGalleries } from "@/services/gallery.service";
import { GalleryLightbox } from "@/components/public/gallery-lightbox";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function plainTextExcerpt(html: string | null, maxLength = 200) {
  if (!html) return "";
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
}

export default async function GaleriDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);
  if (!gallery) notFound();

  const recent = await getRecentGalleries(4);
  const others = recent.filter((g) => g.id !== gallery.id).slice(0, 3);

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/galeri"
        className="mb-6 inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Kembali ke daftar galeri
      </Link>

      <Card className="overflow-hidden">
        {gallery.coverImage && (
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gallery.coverImage}
              alt={gallery.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-6 sm:p-8">
          <header className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
              <Camera className="h-3.5 w-3.5" />
              {gallery.images.length} foto
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {gallery.title}
            </h1>
            <p className="text-xs text-slate-500">
              Diperbarui: {dateFormatter.format(new Date(gallery.updatedAt))}
            </p>
            {gallery.description && (
              <div
                className="prose prose-slate mt-2 max-w-none text-sm text-slate-700"
                dangerouslySetInnerHTML={{ __html: gallery.description }}
              />
            )}
          </header>

          <div className="mt-6">
            <GalleryLightbox images={gallery.images} />
          </div>
        </CardContent>
      </Card>

      {others.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Album Lainnya</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {others.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/galeri/${g.slug}`}
                  className="block overflow-hidden rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-video bg-slate-100">
                    {g.coverImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={g.coverImage}
                        alt={g.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-slate-200 text-blue-900">
                        <Camera className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="truncate text-sm font-medium text-slate-900">{g.title}</p>
                    <p className="text-xs text-slate-500">
                      {plainTextExcerpt(g.description ?? "", 80)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
