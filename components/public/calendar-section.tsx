"use client";

import { useMemo, useState } from "react";
import { Badge } from "flowbite-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type CalendarSchedule  = {
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

interface CalendarSectionProps {
  schedules: CalendarSchedule[];
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

export function CalendarSection({ schedules }: CalendarSectionProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  // Day of week 0 (Sun) - 6 (Sat). Grid starts Sun (Minggu).
  const firstWeekday = firstDay.getDay();

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, CalendarSchedule[]>();
    for (const s of schedules) {
      const d = startOfDay(new Date(s.startAt));
      const key = dateKey(d);
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }
    return map;
  }, [schedules]);

  const selectedSchedules = useMemo(() => {
    if (!selectedDate) return [];
    return schedulesByDate.get(dateKey(selectedDate)) ?? [];
  }, [selectedDate, schedulesByDate]);

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
              Klik tanggal yang memiliki jadwal untuk melihat detail.
            </p>
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
              const items = schedulesByDate.get(key) ?? [];
              const hasSchedules = items.length > 0;
              const isToday = key === dateKey(today);
              const isPast = cell < today;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => hasSchedules && setSelectedDate(cell)}
                  disabled={!hasSchedules}
                  className={`min-h-[88px] border-b border-r border-slate-100 p-2 text-left transition-colors last:border-r-0 ${
                    hasSchedules ? "bg-blue-50 hover:bg-blue-100 cursor-pointer" : "bg-white cursor-default"
                  } ${isPast && !hasSchedules ? "text-slate-400" : "text-slate-900"}`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday ? "bg-blue-600 text-white" : ""
                      }`}
                    >
                      {cell.getDate()}
                    </span>
                    {hasSchedules && (
                      <Badge color="info" size="xs" className="shrink-0">
                        {items.length}
                      </Badge>
                    )}
                  </div>
                  {hasSchedules && (
                    <div className="mt-1 space-y-0.5">
                      {items.slice(0, 2).map((s) => (
                        <p
                          key={s.id}
                          className="truncate text-[11px] font-medium text-slate-700"
                          title={s.title}
                        >
                          {s.title}
                        </p>
                      ))}
                      {items.length > 2 && (
                        <p className="text-[10px] text-slate-500">+{items.length - 2} lainnya</p>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate &&
                `Jadwal ${selectedDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedSchedules.length === 0 ? (
              <p className="text-slate-600">Tidak ada jadwal.</p>
            ) : (
              <ul className="space-y-4">
                {selectedSchedules.map((s) => {
                  const startTime = new Date(s.startAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                  const endTime = new Date(s.endAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <li key={s.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                          <p className="text-sm text-slate-600">{s.location}</p>
                        </div>
                        <Badge color="info">{startTime} - {endTime}</Badge>
                      </div>
                      {s.assignments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {s.assignments.map((a) => (
                            <Badge key={a.id} color="gray">
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
        </DialogContent>
      </Dialog>
    </section>
  );
}
