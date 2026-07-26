import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/services/event.service";
import { Calendar, MapPin, ChevronLeft, Navigation } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(Number(id));
  return {
    title: event ? `${event.title} | Kegiatan Paroki Sandai` : "Kegiatan Tidak Ditemukan",
  };
}

export default async function KegiatanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(Number(id));

  if (!event) notFound();

  const hasCoords = event.latitude !== null && event.longitude !== null;
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps?q=${event.latitude},${event.longitude}`
    : null;

  const dateStr = new Date(event.date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = new Date(event.date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <Link
        href="/kegiatan"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Semua Kegiatan
      </Link>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {event.imageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-56 md:h-72 object-cover"
          />
        )}

        <div className="p-6 md:p-10 space-y-6">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900">
            {event.title}
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 text-slate-600">
            <div className="flex items-start gap-2">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-slate-800">{dateStr}</p>
                <p className="text-sm">Pukul {timeStr} WIB</p>
              </div>
            </div>

            {(event.location || event.address) && (
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  {event.location && (
                    <p className="font-medium text-slate-800">{event.location}</p>
                  )}
                  {event.address && (
                    <p className="text-sm">{event.address}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Buka di Google Maps
            </a>
          )}

          {event.description && (
            <hr className="border-slate-100" />
          )}

          {event.description && (
            <div
              className="prose prose-slate prose-lg max-w-none prose-img:rounded-lg prose-a:text-blue-600"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
