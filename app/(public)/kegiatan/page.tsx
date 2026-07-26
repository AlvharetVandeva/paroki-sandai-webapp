import { Metadata } from "next";
import Link from "next/link";
import { getAllEvents } from "@/services/event.service";
import { Calendar, MapPin } from "lucide-react";
import { PageHeader } from "@/components/public/page-header";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kegiatan | Paroki Sandai",
  description: "Daftar kegiatan dan acara Gereja Katolik Paroki Sandai.",
};

export default async function KegiatanPage() {
  const events = await getAllEvents();
  const now = new Date();

  const upcoming = events.filter((e) => new Date(e.date) >= now);
  const past = events.filter((e) => new Date(e.date) < now);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <PageHeader
        title="Kegiatan Paroki"
        description="Daftar kegiatan dan acara Gereja Katolik Paroki Sandai."
      />

      {events.length === 0 && (
        <p className="text-center text-slate-500 italic mt-12">
          Belum ada kegiatan yang terdaftar.
        </p>
      )}

      {upcoming.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b pb-2">
            Kegiatan Mendatang
          </h2>
          <div className="space-y-4">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-slate-500 mb-4 border-b pb-2">
            Kegiatan Sebelumnya
          </h2>
          <div className="space-y-4 opacity-70">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EventCard({
  event,
}: {
  event: {
    id: number;
    title: string;
    description: string | null;
    date: Date;
    imageUrl: string | null;
    location: string | null;
    address: string | null;
  };
}) {
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
    <Link 
      href={`/kegiatan/${event.id}`} 
      className="flex gap-4 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-200 transition-all group"
    >
      {event.imageUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-32 h-full object-cover shrink-0 hidden sm:block group-hover:scale-105 transition-transform duration-500"
        />
      )}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 shrink-0" />
            {dateStr}, {timeStr}
          </span>
          {(event.location || event.address) && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 shrink-0" />
              {event.location ?? event.address}
            </span>
          )}
        </div>
        {event.description && (
          <div 
            className="text-sm text-slate-600 line-clamp-2 mt-1"
            dangerouslySetInnerHTML={{ __html: event.description }} 
          />
        )}
      </div>
    </Link>
  );
}
