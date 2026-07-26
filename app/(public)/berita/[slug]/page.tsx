import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User as UserIcon } from "lucide-react";
import { getNewsBySlug, getPublishedNews } from "@/services/news.service";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  if (!news || !news.publishedAt || new Date(news.publishedAt) > new Date()) {
    notFound();
  }

  const recent = await getPublishedNews(4);
  const others = recent.filter((n) => n.id !== news.id).slice(0, 3);

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/berita"
        className="mb-6 inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Kembali ke daftar berita
      </Link>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {news.coverImage && (
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={news.coverImage}
              alt={news.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-8">
          <header className="space-y-3 border-b border-slate-200 pb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {news.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {dateFormatter.format(new Date(news.publishedAt))}
              </span>
              {news.author?.name && (
                <span className="inline-flex items-center gap-1.5">
                  {news.author.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={news.author.image}
                      alt={news.author.name}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-3.5 w-3.5" />
                  )}
                  {news.author.name}
                </span>
              )}
            </div>
          </header>

          <div
            className="prose prose-slate mt-6 max-w-none text-slate-800"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          {news.images && news.images.length > 0 && (
            <div className="mt-8 space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Galeri Foto</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {news.images.map((img) => (
                  <figure
                    key={img.id}
                    className="overflow-hidden rounded-lg border border-slate-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.caption ?? ""}
                      className="h-40 w-full object-cover"
                    />
                    {img.caption && (
                      <figcaption className="bg-slate-50 p-2 text-xs text-slate-600">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {others.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Berita Lainnya</h2>
          <ul className="space-y-2">
            {others.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50"
              >
                <Link
                  href={`/berita/${n.slug}`}
                  className="block"
                >
                  <p className="text-sm font-medium text-slate-900 hover:text-cyan-700 hover:underline">
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {n.publishedAt && dateFormatter.format(new Date(n.publishedAt))}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
