import { getAnnouncementById } from "@/services/announcement.service";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: paramId } = await params;
  const id = parseInt(paramId);
  if (isNaN(id)) notFound();

  const announcement = await getAnnouncementById(id);
  if (!announcement) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/announcements">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detail Pengumuman</h1>
            <p className="text-muted-foreground">Lihat detail pengumuman yang dipilih.</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/announcements/${id}/edit`} className="inline-flex items-center justify-center">
            <Pencil className="mr-2 h-4 w-4" /> Edit Pengumuman
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{announcement.title}</CardTitle>
          <CardDescription>
            Dipublikasikan pada{" "}
            {new Date(announcement.createdAt).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-sm sm:prose-base dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: announcement.content }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
