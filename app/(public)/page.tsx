export const dynamic = "force-dynamic";

import { HeroCarousel } from "@/components/public/hero-carousel";
import {
  AnnouncementsSection,
  EventsSection,
  LatestNewsSection,
  PastorGreetingSection,
  SchedulePreviewSection,
} from "@/components/public/home-sections";
import { StatisticsCounter } from "@/components/public/statistics-counter";
import { getSetting } from "@/services/site-setting.service";
import { CalendarSection } from "@/components/public/calendar-section";
import { getRecentAnnouncements } from "@/services/announcement.service";
import { getUpcomingEvents, getEventsForMonth } from "@/services/event.service";
import { getPublishedNews } from "@/services/news.service";
import { getUpcomingSchedules, getSchedulesForMonth } from "@/services/schedule.service";

export default async function Home() {
  const now = new Date();
  const [statJiwa, statKK, statTahunPelayanan, pastorPhoto, pastorGreeting, pastorName, pastorTitle, schedules, monthlySchedules, monthlyEvents, events, announcements, news] = await Promise.all([
    getSetting("statJiwa"),
    getSetting("statKK"),
    getSetting("statTahunPelayanan"),
    getSetting("pastorPhoto"),
    getSetting("pastorGreeting"),
    getSetting("pastorName"),
    getSetting("pastorTitle"),
    getUpcomingSchedules(3),
    getSchedulesForMonth(now.getFullYear(), now.getMonth()),
    getEventsForMonth(now.getFullYear(), now.getMonth()),
    getUpcomingEvents(3),
    getRecentAnnouncements(4),
    getPublishedNews(10),
  ]);

  return (
    <>
      <HeroCarousel />
      <SchedulePreviewSection schedules={schedules} />
      <StatisticsCounter
        jiwa={statJiwa ?? "0"}
        kk={statKK ?? "0"}
        tahunPelayanan={statTahunPelayanan ?? ""}
      />
      <CalendarSection schedules={monthlySchedules} events={monthlyEvents} />
      <EventsSection events={events} />
      <AnnouncementsSection announcements={announcements} />
      <PastorGreetingSection
        photo={pastorPhoto}
        greeting={pastorGreeting}
        name={pastorName}
        title={pastorTitle}
      />
      <LatestNewsSection news={news} />
    </>
  );
}
