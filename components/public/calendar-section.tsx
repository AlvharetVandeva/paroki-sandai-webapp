"use client";

import { useMemo, useState } from "react";
import { Badge } from "flowbite-react";
import { MapPin } from "lucide-react";
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
};

interface CalendarSectionProps {
  schedules: CalendarSchedule[];
  events: CalendarEvent[];
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

export function CalendarSection({ schedules, events }: CalendarSectionProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  // Day of week 0 (Sun) - 6 (Sat). Grid starts Sun (Minggu).
  const firstWeekday = firstDay.getDay();

  // Gabung jadwal + kegiatan ke Map<string, Array<{type, data}>>
  const itemsByDate = useMemo(() => {
    const map = new Map<string, { schedules: CalendarSchedule[]; events: CalendarEvent[] }>();
    const add = (key: string, type: "schedules" | "events", data: CalendarSchedule | CalendarEvent) => {
      const entry = map.get(key) ?? { schedules: [], events: [] };
      (entry[type] as Array<CalendarSchedule | CalendarEvent>).push(data);
      map.set(key, entry);
    };
    for (const s of schedules) {
      const d = startOfDay(new Date(s.startAt));
      add(dateKey(d), "schedules", s);
    }
    for (const e of events) {
      const d = startOfDay(new Date(e.date));
      add(dateKey(d), "events", e);
    }
    return map;
  }, [schedules, events]);

  const selectedItems = useMemo(() => {
    if (!selectedDate) return { schedules: [], events: [] };
    return itemsByDate.get(dateKey(selectedDate)) ?? { schedules: [], events: [] };
  }, [selectedDate, itemsByDate]);

  // Build grid cells: leading empty cells + all days of month
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  // Pad to complete the last row (multiple of 7)
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge color="info" className="mb-3 w-fit">Kalender Pelayanan</Badge>
            <h2 className="text-2xl font-bold text-slate-900">
              {monthNames[month]} {year}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Klik tanggal untuk melihat jadwal pelayanan & kegiatan paroki.
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500" /> Jadwal Pelayanan
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Kegiatan
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {/* Day names header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {dayNames.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-slate-600">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((cell, idx) => {
              if (!cell) {
                return <div key={idx} className="min-h-[88px] border-b border-r border-slate-100 bg-slate-50/50" />;
              }
              const key = dateKey(cell);
              const dayItems = itemsByDate.get(key);
              const schedulesCount = dayItems?.schedules.length ?? 0;
              const eventsCount = dayItems?.events.length ?? 0;
              const totalCount = schedulesCount + eventsCount;
              const hasItems = totalCount > 0;
              const isToday = key === dateKey(today);

              // Gabungkan judul untuk preview cell
              const titles: { type: "schedule" | "event"; title: string; id: number }[] = [];
              dayItems?.schedules.forEach((s) => titles.push({ type: "schedule", title: s.title, id: s.id }));
              dayItems?.events.forEach((e) => titles.push({ type: "event", title: e.title, id: e.id }));

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => hasItems && setSelectedDate(cell)}
                  disabled={!hasItems}
                  className={`min-h-[88px] border-b border-r border-slate-100 p-2 text-left transition-colors last:border-r-0 ${
                    hasItems
                      ? schedulesCount > 0 && eventsCount > 0
                        ? "bg-gradient-to-br from-blue-50 to-emerald-50 hover:from-blue-100 hover:to-emerald-100 cursor-pointer"
                        : schedulesCount > 0
                        ? "bg-blue-50 hover:bg-blue-100 cursor-pointer"
                        : "bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
                      : "bg-white cursor-default"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday ? "bg-blue-600 text-white" : ""
                      }`}
                    >
                      {cell.getDate()}
                    </span>
                    {hasItems && (
                      <div className="flex gap-1">
                        {schedulesCount > 0 && (
                          <Badge color="info" size="xs" className="shrink-0">
                            {schedulesCount}
                          </Badge>
                        )}
                        {eventsCount > 0 && (
                          <Badge color="success" size="xs" className="shrink-0">
                            {eventsCount}
                          </Badge>
                        )}
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
      </div>

      {/* Detail modal (menggunakan shadcn/ui Dialog untuk reliabilitas penuh) */}
      <Dialog open={selectedDate !== null} onOpenChange={(open) => { if (!open) setSelectedDate(null); }}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDate &&
                `Jadwal & Kegiatan ${selectedDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {/* Jadwal Pelayanan */}
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500" />
                Jadwal Pelayanan
              </h3>
              {selectedItems.schedules.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Tidak ada jadwal pelayanan pada tanggal ini.</p>
              ) : (
                <ul className="space-y-3">
                  {selectedItems.schedules.map((s) => {
                    const startTime = new Date(s.startAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                    const endTime = new Date(s.endAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <li key={s.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{s.title}</h4>
                            <p className="text-xs text-slate-600">{s.location}</p>
                          </div>
                          <Badge color="info" size="sm">{startTime} - {endTime}</Badge>
                        </div>
                        {s.assignments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {s.assignments.map((a) => (
                              <Badge key={a.id} color="gray" size="sm">
                                {a.person ? `${a.person.fullName} → ${a.person.role?.name ?? a.role.name}` : a.role.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Kegiatan */}
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                Kegiatan
              </h3>
              {selectedItems.events.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Tidak ada kegiatan pada tanggal ini.</p>
              ) : (
                <ul className="space-y-3">
                  {selectedItems.events.map((e) => {
                    const time = new Date(e.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                    const hasCoords = typeof e.latitude === "number" && typeof e.longitude === "number";
                    const mapsUrl = hasCoords
                      ? `https://www.google.com/maps/search/?api=1&query=${e.latitude},${e.longitude}`
                      : null;
                    return (
                      <li key={e.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{e.title}</h4>
                            {e.location && <p className="text-xs text-slate-600">{e.location}</p>}
                          </div>
                          <Badge color="success" size="sm">{time}</Badge>
                        </div>
                        {e.description && (
                          <div
                            className="prose prose-slate prose-xs mt-2 max-w-none text-xs text-slate-600"
                            dangerouslySetInnerHTML={{ __html: e.description }}
                          />
                        )}
                        {mapsUrl && (
                          <div className="mt-3 flex justify-end">
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 hover:border-emerald-300"
                            >
                              <MapPin className="h-3.5 w-3.5" />
                              Lihat di Peta
                            </a>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
