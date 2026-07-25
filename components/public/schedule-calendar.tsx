"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "flowbite-react";
import { ChevronLeft, ChevronRight, MapPin, Clock, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type CalendarSchedule = {
  id: number;
  title: string;
  startAt: Date | string;
  endAt: Date | string;
  location: string;
  description?: string | null;
  assignments: {
    id: number;
    person: { id: number; fullName: string; role: { name: string } | null } | null;
    role: { name: string };
  }[];
};

export type CalendarEvent = {
  id: number;
  title: string;
  description: string | null;
  date: Date | string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
};

interface ScheduleCalendarProps {
  year: number;
  month: number; // 0-indexed
  monthlySchedules: CalendarSchedule[];
  monthlyEvents: CalendarEvent[];
  upcomingSchedules: CalendarSchedule[];
  upcomingEvents: CalendarEvent[];
}

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function ScheduleCalendar({
  year: initialYear,
  month: initialMonth,
  monthlySchedules,
  monthlyEvents,
  upcomingSchedules,
  upcomingEvents,
}: ScheduleCalendarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const today = useMemo(() => startOfDay(new Date()), []);

  // State tanggal yang sedang dipilih (null = tidak ada)
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);

  // Build index: yyyy-mm-dd -> { schedules, events }
  const itemsByDate = useMemo(() => {
    const map = new Map<string, { schedules: CalendarSchedule[]; events: CalendarEvent[] }>();
    const add = (key: string, type: "schedules" | "events", data: CalendarSchedule | CalendarEvent) => {
      const entry = map.get(key) ?? { schedules: [], events: [] };
      (entry[type] as Array<CalendarSchedule | CalendarEvent>).push(data);
      map.set(key, entry);
    };
    for (const s of monthlySchedules) add(dateKey(startOfDay(new Date(s.startAt))), "schedules", s);
    for (const e of monthlyEvents) add(dateKey(startOfDay(new Date(e.date))), "events", e);
    return map;
  }, [monthlySchedules, monthlyEvents]);

  const firstDay = new Date(initialYear, initialMonth, 1);
  const lastDay = new Date(initialYear, initialMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const firstWeekday = firstDay.getDay();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(initialYear, initialMonth, d));
  while (cells.length % 7 !== 0) cells.push(null);

  // Sidebar content untuk tanggal yang dipilih
  const selectedKey = selectedDate ? dateKey(selectedDate) : null;
  const selectedDayItems = selectedKey ? itemsByDate.get(selectedKey) : null;
  const selectedSchedules = selectedDayItems?.schedules ?? [];
  const selectedEvents = selectedDayItems?.events ?? [];

  // Items untuk modal detail event
  const [detailItem, setDetailItem] = useState<
    | { type: "schedule"; data: CalendarSchedule }
    | { type: "event"; data: CalendarEvent }
    | null
  >(null);

  function navigateMonth(delta: number) {
    const newDate = new Date(initialYear, initialMonth + delta, 1);
    const newYear = newDate.getFullYear();
    const newMonth = newDate.getMonth() + 1; // 1-indexed for URL
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("month", `${newYear}-${pad2(newMonth)}`);
    startTransition(() => {
      router.push(`?${sp.toString()}`);
    });
  }

  function goToToday() {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("month");
    startTransition(() => {
      router.push(`?${sp.toString()}`);
    });
  }

  return (
    <section className="bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Kalender Pelayanan</h1>
          <p className="text-slate-600">Jadwal misa & kegiatan pelayanan Paroki Sandai</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          {/* ============== KALENDER (KIRI 60%) ============== */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            {/* Header kalender: nav prev/next, judul bulan, tombol "hari ini" */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {monthNames[initialMonth]} {initialYear}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToToday}
                  disabled={isPending}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => navigateMonth(-1)}
                  disabled={isPending}
                  className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  aria-label="Bulan sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateMonth(1)}
                  disabled={isPending}
                  className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  aria-label="Bulan berikutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="mb-3 flex flex-wrap gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500" /> Jadwal Pelayanan
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Kegiatan
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-gradient-to-br from-blue-500 to-emerald-500" /> Keduanya
              </span>
            </div>

            {/* Hari */}
            <div className="grid grid-cols-7 border-b border-slate-200">
              {dayNames.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-slate-600">
                  {d}
                </div>
              ))}
            </div>

            {/* Cell kalender */}
            <div className="grid grid-cols-7">
              {cells.map((cell, idx) => {
                if (!cell) {
                  return <div key={idx} className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/50" />;
                }
                const key = dateKey(cell);
                const dayItems = itemsByDate.get(key);
                const sc = dayItems?.schedules.length ?? 0;
                const ev = dayItems?.events.length ?? 0;
                const total = sc + ev;
                const hasItems = total > 0;
                const isToday = key === dateKey(today);
                const isSelected = selectedKey === key;

                const titles: { type: "schedule" | "event"; id: number; title: string }[] = [];
                dayItems?.schedules.forEach((s) => titles.push({ type: "schedule", id: s.id, title: s.title }));
                dayItems?.events.forEach((e) => titles.push({ type: "event", id: e.id, title: e.title }));

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(cell)}
                    className={`min-h-[100px] border-b border-r border-slate-100 p-1.5 text-left transition-colors last:border-r-0 ${
                      isSelected
                        ? "ring-2 ring-blue-500 ring-inset"
                        : ""
                    } ${
                      hasItems
                        ? sc > 0 && ev > 0
                          ? "bg-gradient-to-br from-blue-50 to-emerald-50 hover:from-blue-100 hover:to-emerald-100"
                          : sc > 0
                          ? "bg-blue-50 hover:bg-blue-100"
                          : "bg-emerald-50 hover:bg-emerald-100"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                          isToday
                            ? "bg-blue-600 text-white"
                            : isSelected
                            ? "text-blue-700"
                            : "text-slate-700"
                        }`}
                      >
                        {cell.getDate()}
                      </span>
                      {hasItems && (
                        <div className="flex gap-1">
                          {sc > 0 && <Badge color="info" size="xs">{sc}</Badge>}
                          {ev > 0 && <Badge color="success" size="xs">{ev}</Badge>}
                        </div>
                      )}
                    </div>
                    {hasItems && (
                      <div className="mt-1 space-y-0.5">
                        {titles.slice(0, 2).map((t) => (
                          <p
                            key={`${t.type}-${t.id}`}
                            className={`truncate text-[11px] font-medium ${
                              t.type === "event" ? "text-emerald-700" : "text-slate-700"
                            }`}
                            title={t.title}
                          >
                            {t.title}
                          </p>
                        ))}
                        {titles.length > 2 && (
                          <p className="text-[10px] text-slate-500">+{titles.length - 2} lainnya</p>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ============== SIDEBAR (KANAN 40%) ============== */}
          <aside className="space-y-6">
            {/* Sidebar: detail tanggal yang dipilih */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="mb-3 text-base font-bold text-slate-900">
                {selectedDate
                  ? selectedDate.toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Pilih tanggal"}
              </h3>

              {selectedSchedules.length === 0 && selectedEvents.length === 0 ? (
                <p className="text-sm italic text-slate-500">Tidak ada jadwal pada tanggal ini.</p>
              ) : (
                <ul className="space-y-2.5">
                  {selectedSchedules.map((s) => {
                    const startTime = new Date(s.startAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                    const endTime = new Date(s.endAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <li key={`s-${s.id}`}>
                        <button
                          type="button"
                          onClick={() => setDetailItem({ type: "schedule", data: s })}
                          className="w-full rounded-lg border border-blue-200 bg-blue-50 p-3 text-left transition-colors hover:bg-blue-100"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <Badge color="info" className="mb-1.5">
                                Jadwal Pelayanan
                              </Badge>
                              <h4 className="truncate text-sm font-bold text-slate-900">{s.title}</h4>
                              {s.location && (
                                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-600">
                                  <MapPin className="h-3 w-3 shrink-0" /> {s.location}
                                </p>
                              )}
                            </div>
                            <span className="shrink-0 text-xs font-medium text-slate-700">
                              {startTime} - {endTime}
                            </span>
                          </div>
                          {s.assignments.length > 0 && (
                            <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                              <User className="h-3 w-3" />
                              {s.assignments.length} petugas
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                  {selectedEvents.map((e) => {
                    const time = new Date(e.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <li key={`e-${e.id}`}>
                        <button
                          type="button"
                          onClick={() => setDetailItem({ type: "event", data: e })}
                          className="w-full rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-left transition-colors hover:bg-emerald-100"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <Badge color="success" className="mb-1.5">
                                Kegiatan
                              </Badge>
                              <h4 className="truncate text-sm font-bold text-slate-900">{e.title}</h4>
                              {e.location && (
                                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-600">
                                  <MapPin className="h-3 w-3 shrink-0" /> {e.location}
                                </p>
                              )}
                            </div>
                            <span className="shrink-0 text-xs font-medium text-slate-700">{time}</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Sidebar: Mendatang */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="mb-3 text-base font-bold text-slate-900">Akan Datang</h3>

              {upcomingSchedules.length === 0 && upcomingEvents.length === 0 ? (
                <p className="text-sm italic text-slate-500">Belum ada jadwal terdekat.</p>
              ) : (
                <ul className="space-y-2">
                  {upcomingSchedules.map((s) => {
                    const d = new Date(s.startAt);
                    return (
                      <li key={`us-${s.id}`}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate(d);
                            setDetailItem({ type: "schedule", data: s });
                          }}
                          className="block w-full rounded-md p-2 text-left transition-colors hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <Clock className="h-3 w-3" />
                            {d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </div>
                          <p className="truncate text-sm font-medium text-slate-800">{s.title}</p>
                        </button>
                      </li>
                    );
                  })}
                  {upcomingEvents.map((e) => {
                    const d = new Date(e.date);
                    return (
                      <li key={`ue-${e.id}`}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate(d);
                            setDetailItem({ type: "event", data: e });
                          }}
                          className="block w-full rounded-md p-2 text-left transition-colors hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <Clock className="h-3 w-3" />
                            {d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </div>
                          <p className="truncate text-sm font-medium text-slate-800">{e.title}</p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <Link
                href="/"
                className="mt-3 inline-block text-xs font-medium text-blue-600 hover:underline"
              >
                Lihat beranda →
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal detail */}
      <Dialog open={detailItem !== null} onOpenChange={(open) => { if (!open) setDetailItem(null); }}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detailItem?.type === "schedule" ? "Detail Jadwal Pelayanan" : "Detail Kegiatan"}
            </DialogTitle>
          </DialogHeader>

          {detailItem?.type === "schedule" && (
            <div className="space-y-4 py-2">
              <div>
                <Badge color="info">Jadwal Pelayanan</Badge>
                <h2 className="mt-2 text-lg font-bold text-slate-900">{detailItem.data.title}</h2>
              </div>
              <div className="space-y-1 text-sm text-slate-700">
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {new Date(detailItem.data.startAt).toLocaleString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  {" – "}
                  {new Date(detailItem.data.endAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </p>
                {detailItem.data.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {detailItem.data.location}
                  </p>
                )}
              </div>
              {detailItem.data.description && (
                <div
                  className="prose prose-slate prose-sm max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: detailItem.data.description }}
                />
              )}
              {detailItem.data.assignments.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-slate-900">Petugas Pelayanan</h3>
                  <div className="space-y-1.5">
                    {detailItem.data.assignments.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2"
                      >
                        <span className="text-sm text-slate-800">
                          {a.person?.fullName ?? <em className="text-slate-400">Belum ditentukan</em>}
                        </span>
                        <Badge color="gray" size="sm">{a.role.name}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {detailItem?.type === "event" && (
            <div className="space-y-4 py-2">
              <div>
                <Badge color="success">Kegiatan</Badge>
                <h2 className="mt-2 text-lg font-bold text-slate-900">{detailItem.data.title}</h2>
              </div>
              <div className="space-y-1 text-sm text-slate-700">
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {new Date(detailItem.data.date).toLocaleString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
                {detailItem.data.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {detailItem.data.location}
                  </p>
                )}
              </div>
              {detailItem.data.description && (
                <div
                  className="prose prose-slate prose-sm max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: detailItem.data.description }}
                />
              )}
              {detailItem.data.latitude !== null && detailItem.data.longitude !== null && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${detailItem.data.latitude},${detailItem.data.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Lihat di Peta
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
