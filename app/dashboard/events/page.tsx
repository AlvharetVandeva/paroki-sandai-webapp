import { getAllEvents } from "@/services/event.service";
import { EventsClient } from "./events-client";

export default async function EventsPage() {
  const events = await getAllEvents();
  return <EventsClient events={events} />;
}
