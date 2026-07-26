import { getSchedulesForMonth, getUpcomingSchedules } from "@/services/schedule.service";
import { getEventsForMonth, getUpcomingEvents } from "@/services/event.service";
import { ScheduleCalendar, type CalendarSchedule, type CalendarEvent } from "@/components/public/schedule-calendar";

export const metadata = {
  title: "Jadwal Pelayanan | Paroki Sandai",
  description: "Kalender lengkap jadwal misa dan kegiatan pelayanan Paroki Sandai.",
};

type SearchParams = Promise<{ month?: string }>;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function mapSchedule(s: any): CalendarSchedule {
  return {
    id: s.id,
    title: s.title,
    startAt: s.startAt,
    endAt: s.endAt,
    location: s.location,
    description: s.description,
    latitude: s.latitude,
    longitude: s.longitude,
    address: s.address,
    assignments: (s.assignments ?? []).map((a: any) => ({
      id: a.id,
      person: a.person
        ? { id: a.person.id, fullName: a.person.fullName, role: a.person.role ?? null }
        : null,
      role: { name: a.role?.name ?? "" },
    })),
  };
}

function mapEvent(e: any): CalendarEvent {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.date,
    location: e.location,
    latitude: e.latitude,
    longitude: e.longitude,
    address: e.address,
  };
}

export default async function JadwalPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  let year: number;
  let month: number; // 0-indexed

  if (params.month && /^\d{4}-\d{2}$/.test(params.month)) {
    const [y, m] = params.month.split("-").map(Number);
    year = y;
    month = m - 1;
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
  }

  const [rawMonthlySchedules, rawMonthlyEvents, rawUpcomingSchedules, rawUpcomingEvents] = await Promise.all([
    getSchedulesForMonth(year, month),
    getEventsForMonth(year, month),
    getUpcomingSchedules(5),
    getUpcomingEvents(5),
  ]);

  const monthlySchedules = rawMonthlySchedules.map(mapSchedule);
  const monthlyEvents = rawMonthlyEvents.map(mapEvent);
  const upcomingSchedules = rawUpcomingSchedules.map(mapSchedule);
  const upcomingEvents = rawUpcomingEvents.map(mapEvent);

  return (
    <ScheduleCalendar
      year={year}
      month={month}
      monthlySchedules={monthlySchedules}
      monthlyEvents={monthlyEvents}
      upcomingSchedules={upcomingSchedules}
      upcomingEvents={upcomingEvents}
    />
  );
}
