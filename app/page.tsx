import { HeroCarousel } from "@/components/public/hero-carousel";
import {
  AnnouncementsSection,
  EventsSection,
  LatestNewsSection,
  PastorGreetingSection,
  SchedulePreviewSection,
} from "@/components/public/home-sections";
import { CalendarSection } from "@/components/public/calendar-section";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicNavbar } from "@/components/public/public-navbar";
import { getRecentAnnouncements } from "@/services/announcement.service";
import { getUpcomingEvents, getEventsForMonth } from "@/services/event.service";
import { getPublishedNews } from "@/services/news.service";
import { getUpcomingSchedules, getSchedulesForMonth } from "@/services/schedule.service";
import { getPublicSettings } from "@/services/site-setting.service";

export default async function Home() {
  const now = new Date();
  const [schedules, monthlySchedules, monthlyEvents, events, announcements, news, settings] = await Promise.all([
    getUpcomingSchedules(3),
    getSchedulesForMonth(now.getFullYear(), now.getMonth()),
    getEventsForMonth(now.getFullYear(), now.getMonth()),
    getUpcomingEvents(3),
    getRecentAnnouncements(4),
    getPublishedNews(10),
    getPublicSettings(),
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <PublicNavbar />
      <HeroCarousel />
      <SchedulePreviewSection schedules={schedules} />
      <CalendarSection schedules={monthlySchedules} events={monthlyEvents} />
      <EventsSection events={events} />
      <AnnouncementsSection announcements={announcements} />
      <PastorGreetingSection />
      <LatestNewsSection news={news} />
      <PublicFooter settings={settings} />
    </main>
  );
}
