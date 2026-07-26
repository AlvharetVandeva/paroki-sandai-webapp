import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Megaphone, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getAnnouncementById, getRecentAnnouncements } from "@/services/announcement.service";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function PengumumanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const announcementId = Number(id);
  if (Number.isNaN(announcementId)) notFound();

  const [announcement, recent] = await Promise.all([
    getAnnouncementById(announcementId),
    getRecentAnnouncements(4),
  ]);

  if (!announcement) notFound();

  const others = recent.filter((a) => a.id !== announcement.id).slice(0, 3);

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/pengumuman"
        className="mb-6 inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Kembali ke daftar pengumuman
      </Link>

      <Card>
        <CardContent className="space-y-6 p-6">
          <header className="space-y-3 border-b border-slate-200 pb-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                <Megaphone className="h-3.5 w-3.5" />
                Pengumuman
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {dateFormatter.format(new Date(announcement.createdAt))}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {announcement.title}
            </h1>
          </header>

          <div
            className="prose prose-slate max-w-none text-slate-800"
            dangerouslySetInnerHTML={{ __html: announcement.content }}
          />
        </CardContent>
      </Card>

      {others.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Pengumuman Lainnya</h2>
          <ul className="space-y-2">
            {others.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/pengumuman/${a.id}`}
                    className="block truncate text-sm font-medium text-slate-900 hover:text-blue-700 hover:underline"
                  >
                    {a.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {dateFormatter.format(new Date(a.createdAt))}
                  </p>
                </div>
                <Link
                  href={`/pengumuman/${a.id}`}
                  className="inline-flex h-8 items-center rounded-md px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Baca
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
