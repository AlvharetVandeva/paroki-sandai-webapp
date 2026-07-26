import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/public/page-header";
import { getPublishedNewsPage, getPublishedNews } from "@/services/news.service";

export const metadata = {
  title: "Berita | Paroki Sandai",
  description: "Berita dan informasi terbaru dari Paroki Sandai.",
};

type SearchParams = Promise<{ page?: string; q?: string }>;
const PAGE_SIZE = 9;

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function plainTextExcerpt(html: string, maxLength = 200) {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
}

export default async function BeritaPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const query = (params.q ?? "").trim();

  // Hero: berita terbaru (published only, no query filter)
  const latest = query || page !== 1
    ? null
    : (await getPublishedNews(1))[0] ?? null;

  // Grid: halaman saat ini
  const data = await getPublishedNewsPage({ page, pageSize: PAGE_SIZE, query });

  // Untuk featured: kalau di page 1, lewati item pertama (sudah ditampilkan di hero)
  const gridItems = latest ? data.items.filter((n) => n.id !== latest.id) : data.items;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Berita"
        description="Kabar terbaru dari Paroki Sandai."
      />

      <form method="GET" className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Cari berita..."
            className="pl-8"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Cari
        </button>
        {query && (
          <Link
            href="/berita"
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Reset
          </Link>
        )}
      </form>

      {data.total === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Tidak ada berita yang ditemukan.
        </div>
      )}

      {latest && (
        <article className="group mb-8 grid gap-6 overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg md:grid-cols-2">
          <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 md:aspect-auto">
            {latest.coverImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={latest.coverImage}
                alt={latest.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full min-h-[240px] items-center justify-center bg-gradient-to-br from-blue-100 to-slate-200 text-2xl font-semibold text-blue-900">
                Paroki Sandai
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center p-6">
            <span className="mb-2 inline-flex w-fit rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
              Terbaru
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              <Link
                href={`/berita/${latest.slug}`}
                className="hover:text-cyan-700 hover:underline"
              >
                {latest.title}
              </Link>
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {latest.publishedAt && dateFormatter.format(new Date(latest.publishedAt))}
              {latest.author?.name && ` • ${latest.author.name}`}
            </p>
            <p className="mt-3 line-clamp-3 text-sm text-slate-600">
              {plainTextExcerpt(latest.content, 280)}
            </p>
            <Link
              href={`/berita/${latest.slug}`}
              className="mt-4 inline-block w-fit text-sm font-medium text-cyan-600 hover:underline"
            >
              Baca selengkapnya →
            </Link>
          </div>
        </article>
      )}

      {gridItems.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {gridItems.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
            >
              <Link
                href={`/berita/${item.slug}`}
                className="relative block aspect-[16/10] overflow-hidden bg-slate-100"
              >
                {item.coverImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-slate-200 text-sm font-semibold text-blue-900">
                    Paroki Sandai
                  </div>
                )}
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-xs text-slate-500">
                  {item.publishedAt && dateFormatter.format(new Date(item.publishedAt))}
                  {item.author?.name && ` • ${item.author.name}`}
                </p>
                <h3 className="mt-1 text-base font-bold leading-snug text-slate-900 line-clamp-2 group-hover:text-cyan-700">
                  <Link href={`/berita/${item.slug}`}>{item.title}</Link>
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                  {plainTextExcerpt(item.content, 140)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {data.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-600">
            Halaman {data.page} dari {data.totalPages} ({data.total} berita)
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={page > 1 ? `?page=${page - 1}${query ? `&q=${encodeURIComponent(query)}` : ""}` : "#"}
              aria-disabled={page <= 1}
              className={`rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium ${
                page > 1
                  ? "text-slate-700 hover:bg-slate-50"
                  : "pointer-events-none text-slate-300"
              }`}
            >
              Sebelumnya
            </Link>
            <Link
              href={
                page < data.totalPages
                  ? `?page=${page + 1}${query ? `&q=${encodeURIComponent(query)}` : ""}`
                  : "#"
              }
              aria-disabled={page >= data.totalPages}
              className={`rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium ${
                page < data.totalPages
                  ? "text-slate-700 hover:bg-slate-50"
                  : "pointer-events-none text-slate-300"
              }`}
            >
              Selanjutnya
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
