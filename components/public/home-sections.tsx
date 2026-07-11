import { Card, Badge } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";

export type UpcomingSchedule = {
  id: number;
  title: string;
  startAt: Date;
  endAt: Date;
  location: string;
  assignments: {
    person: { fullName: string } | null;
    role: { name: string };
  }[];
};

export type UpcomingEvent = {
  id: number;
  title: string;
  description: string | null;
  date: Date;
  location: string | null;
};

export type RecentAnnouncement = {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
};

export type LatestNews = {
  id: number;
  title: string;
  slug: string;
  content: string;
  coverImage: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  author: {
    name: string;
    image: string | null;
  };
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(date: Date) {
  return dateFormatter.format(date);
}

function formatTimeRange(start: Date, end: Date) {
  return `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
}

function excerpt(text: string, maxLength = 140) {
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
}

function htmlExcerpt(html: string, maxLength = 130) {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return excerpt(text, maxLength);
}

export function SchedulePreviewSection({ schedules }: { schedules: UpcomingSchedule[] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge color="info" className="mb-3 w-fit">Jadwal Pelayanan</Badge>
          <h2 className="text-3xl font-bold text-slate-900">Kalender Pelayanan</h2>
        </div>
        <Link className="text-sm font-medium text-blue-600 hover:underline" href="/jadwal">
          Lihat Semua
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm text-left bg-white">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Hari/Tanggal</th>
              <th className="px-4 py-3 font-semibold">Kegiatan</th>
              <th className="px-4 py-3 font-semibold">Pukul</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">Belum ada jadwal pelayanan mendatang.</td>
              </tr>
            ) : (
              schedules.map((s, i) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {new Date(s.startAt).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">{s.title}</td>
                  <td className="px-4 py-3">
                    {new Date(s.startAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    - 
                    {new Date(s.endAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function EventsSection({ events }: { events: UpcomingEvent[] }) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge color="success" className="mb-3 w-fit">Kegiatan</Badge>
            <h2 className="text-3xl font-bold text-slate-900">Kegiatan Mendatang</h2>
          </div>
          <Link className="text-sm font-medium text-blue-600 hover:underline" href="/kegiatan">
            Lihat Semua
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 p-6 text-slate-600 text-center">Belum ada kegiatan mendatang.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="shadow-none border-slate-200">
                <div className="flex flex-col h-full">
                  <Badge color="success" className="mb-2 w-fit">
                    {formatDate(event.date)}
                  </Badge>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">{event.title}</h3>
                  {event.description && (
                    <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                      {htmlExcerpt(event.description, 100)}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function AnnouncementsSection({ announcements }: { announcements: RecentAnnouncement[] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge color="warning" className="mb-3 w-fit">Pengumuman</Badge>
          <h2 className="text-3xl font-bold text-slate-900">Pengumuman Singkat</h2>
        </div>
        <Link className="text-sm font-medium text-blue-600 hover:underline" href="/pengumuman">
          Lihat Arsip
        </Link>
      </div>

      {announcements.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 text-center">Belum ada pengumuman.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="shadow-none border-slate-200">
              <div className="flex flex-col h-full">
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  {new Date(announcement.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <h3 className="text-base font-bold text-slate-900 leading-tight">{announcement.title}</h3>
                <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                  {htmlExcerpt(announcement.content, 90)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

export function PastorGreetingSection() {
  return (
    <section className="bg-blue-950 py-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[280px_1fr] lg:items-center">
        <div className="h-72 overflow-hidden rounded-3xl bg-blue-900 shadow-xl">
          <Image
            width={560}
            height={560}
            src="/uploads/c85e0f03265664b6.webp"
            alt="Pastor Paroki Sandai"
            className="h-full w-full object-cover opacity-90"
          />
        </div>
        <blockquote>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">Sambutan Pastor</p>
          <p className="mt-4 text-2xl font-semibold leading-relaxed sm:text-3xl">
            “Semoga website ini membantu umat menemukan informasi pelayanan, jadwal misa, dan kegiatan paroki dengan lebih mudah.”
          </p>
          <footer className="mt-6 text-blue-100">
            <strong>Pastor Paroki Sandai</strong>
            <span className="block text-sm">Paroki Sandai</span>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}

export function LatestNewsSection({ news }: { news: LatestNews[] }) {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">Berita</span>
            <h2 className="text-3xl font-bold text-slate-900">Berita Terbaru</h2>
            <p className="mt-2 text-slate-600">Kabar terbaru dari Paroki Sandai.</p>
          </div>
          <Link className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100" href="/berita">
            Lihat Semua Berita
          </Link>
        </div>

        {news.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Belum ada berita terbaru.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <Link
                key={item.id}
                href={`/berita/${item.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-[16/10] bg-slate-200 w-full shrink-0">
                  {item.coverImage ? (
                    <Image
                      fill
                      src={item.coverImage}
                      alt={item.title}
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-slate-200 text-sm font-semibold text-blue-900">
                      Paroki Sandai
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-grow space-y-3 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {item.author.name} • {formatDate(item.publishedAt ?? item.createdAt)}
                  </p>
                  <h3 className="text-xl font-bold leading-snug text-slate-900 group-hover:text-blue-800 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-6 text-slate-600 flex-grow line-clamp-3">
                    {htmlExcerpt(item.content, 150)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
