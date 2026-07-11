import { HeroCarousel } from "@/components/public/hero-carousel";
import {
  AnnouncementsSection,
  EventsSection,
  LatestNewsSection,
  PastorGreetingSection,
  SchedulePreviewSection,
} from "@/components/public/home-sections";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicNavbar } from "@/components/public/public-navbar";
import { getRecentAnnouncements } from "@/services/announcement.service";
import { getUpcomingEvents } from "@/services/event.service";
import { getPublishedNews } from "@/services/news.service";
import { getUpcomingSchedules } from "@/services/schedule.service";
import { getPublicSettings } from "@/services/site-setting.service";

export default async function Home() {
  const [schedules, events, announcements, news, settings] = await Promise.all([
    getUpcomingSchedules(5),
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
      <EventsSection events={events} />
      <AnnouncementsSection announcements={announcements} />
      <PastorGreetingSection />
      <LatestNewsSection news={news} />
      <PublicFooter settings={settings} />
    </main>
  );
}
