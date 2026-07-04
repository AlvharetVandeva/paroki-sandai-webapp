import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventById } from "@/services/event.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, MapPin, AlignLeft, ChevronLeft, Pencil } from "lucide-react";

import StaticMapClient from "./static-map-client";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(Number(id));

  if (!event) {
    notFound();
  }

  const hasCoordinates = event.latitude !== null && event.longitude !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" render={<Link href="/dashboard/events" />} nativeButton={false}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detail Kegiatan</h1>
            <p className="text-muted-foreground">Informasi lengkap kegiatan paroki.</p>
          </div>
        </div>
        <Button variant="default" render={<Link href={`/dashboard/events/${event.id}/edit`} />} nativeButton={false}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              <CardDescription>Dibuat di sistem paroki</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Waktu Pelaksanaan</h4>
                  <p className="text-muted-foreground">
                    {new Date(event.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Lokasi / Alamat</h4>
                  <p className="text-muted-foreground whitespace-pre-line">{event.location}</p>
                </div>
              </div>

              {event.description && (
                <div className="flex items-start gap-3">
                  <AlignLeft className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Deskripsi Kegiatan</h4>
                    <div className="text-muted-foreground mt-1 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: event.description }} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Peta Lokasi</CardTitle>
            </CardHeader>
            <CardContent>
              {hasCoordinates ? (
                <div className="space-y-4">
                  <div className="h-[250px] w-full rounded-md border overflow-hidden">
                    <StaticMapClient latitude={event.latitude!} longitude={event.longitude!} />
                  </div>
                  <div className="text-sm font-mono text-muted-foreground bg-muted p-2 rounded-md">
                    <div>Lat: {event.latitude}</div>
                    <div>Lng: {event.longitude}</div>
                  </div>
                </div>
              ) : (
                <div className="flex h-[250px] items-center justify-center rounded-md border border-dashed text-muted-foreground bg-muted/50 p-4 text-center text-sm">
                  Tidak ada data koordinat peta untuk kegiatan ini.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



