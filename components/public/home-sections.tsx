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
          <span className="mb-3 inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">Jadwal Pelayanan</span>
          <h2 className="text-3xl font-bold text-slate-900">Jadwal misa dan pelayanan terdekat</h2>
          <p className="mt-2 text-slate-600">Ringkasan kegiatan pelayanan yang akan datang.</p>
        </div>
        <Link className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100" href="/jadwal">
          Lihat Semua Jadwal
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {schedules.length === 0 ? (
          <p className="p-6 text-slate-600">Belum ada jadwal pelayanan mendatang.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {schedules.map((schedule) => (
              <article key={schedule.id} className="grid gap-4 p-6 md:grid-cols-[220px_1fr]">
                <div>
                  <p className="font-semibold text-blue-900">{formatDate(schedule.startAt)}</p>
                  <p className="text-sm text-slate-600">{formatTimeRange(schedule.startAt, schedule.endAt)}</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{schedule.title}</h3>
                  <p className="mt-1 text-slate-600">{schedule.location}</p>
                  {schedule.assignments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {schedule.assignments.slice(0, 4).map((assignment) => (
                        <span
                          key={`${schedule.id}-${assignment.role.name}-${assignment.person?.fullName ?? "kosong"}`}
                          className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {assignment.role.name}: {assignment.person?.fullName ?? "Belum ditentukan"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
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
            <span className="mb-3 inline-flex w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">Kegiatan</span>
            <h2 className="text-3xl font-bold text-slate-900">Kegiatan Mendatang</h2>
            <p className="mt-2 text-slate-600">Agenda paroki yang dapat diikuti umat.</p>
          </div>
          <Link className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100" href="/kegiatan">
            Lihat Semua Kegiatan
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 p-6 text-slate-600">Belum ada kegiatan mendatang.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article key={event.id} className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-blue-700">{formatDate(event.date)}</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{event.title}</h3>
                {event.location && <p className="mt-2 text-sm text-slate-600">{event.location}</p>}
                {event.description && (
                  <div
                    className="prose prose-slate mt-4 max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function AnnouncementsSection({ announcements }: { announcements: RecentAnnouncement[] }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_420px]">
      <div>
        <span className="mb-3 inline-flex w-fit rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">Pengumuman</span>
        <h2 className="text-3xl font-bold text-slate-900">Pengumuman singkat</h2>
        <p className="mt-2 text-slate-600">Informasi terbaru dari sekretariat dan pelayanan paroki.</p>
        <Link className="mt-6 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100" href="/pengumuman">
          Lihat Arsip Pengumuman
        </Link>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Belum ada pengumuman.</p>
        ) : (
          announcements.map((announcement) => (
            <article key={announcement.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {formatDate(announcement.createdAt)}
              </p>
              <h3 className="mt-2 text-lg font-bold text-slate-900">{announcement.title}</h3>
              <div
                className="prose prose-slate mt-3 max-w-none text-slate-700"
                dangerouslySetInnerHTML={{ __html: announcement.content }}
              />
            </article>
          ))
        )}
      </div>
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
