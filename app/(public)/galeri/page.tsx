import Link from "next/link";
import { Images, Camera } from "lucide-react";
import { getAllGalleries } from "@/services/gallery.service";

export const metadata = {
  title: "Galeri | Paroki Sandai",
  description: "Galeri foto kegiatan dan dokumentasi Paroki Sandai.",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function plainTextExcerpt(html: string | null, maxLength = 140) {
  if (!html) return "";
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text;
}

export default async function GaleriPage() {
  const galleries = await getAllGalleries();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Galeri</h1>
        <p className="text-slate-600">Album foto kegiatan dan dokumentasi paroki</p>
      </div>

      {galleries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Belum ada album galeri.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {galleries.map((g) => {
            const count = (g as any)._count?.images ?? 0;
            return (
              <Link
                key={g.id}
                href={`/galeri/${g.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  {g.coverImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={g.coverImage}
                      alt={g.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-slate-200 text-2xl font-semibold text-blue-900">
                      <Camera className="h-10 w-10" />
                    </div>
                  )}
                  {count > 0 && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                      <Images className="h-3.5 w-3.5" />
                      {count} foto
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs text-slate-500">
                    {dateFormatter.format(new Date(g.createdAt))}
                  </p>
                  <h2 className="mt-1 text-base font-bold leading-snug text-slate-900 line-clamp-2 group-hover:text-cyan-700">
                    {g.title}
                  </h2>
                  {g.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {plainTextExcerpt(g.description, 120)}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
