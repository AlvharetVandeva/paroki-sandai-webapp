import { getAllAnnouncements } from "@/services/announcement.service";
import { AnnouncementsClient } from "./announcements-client";

export default async function AnnouncementsPage() {
  const announcements = await getAllAnnouncements();
  return <AnnouncementsClient announcements={announcements} />;
}
