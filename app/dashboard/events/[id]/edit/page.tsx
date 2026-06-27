import { notFound } from "next/navigation";
import { getEventById } from "@/services/event.service";
import EventForm from "@/components/event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(Number(id));

  if (!event) {
    notFound();
  }

  return <EventForm initialData={event} />;
}
