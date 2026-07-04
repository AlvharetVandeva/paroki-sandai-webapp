import { getAnnouncementById } from "@/services/announcement.service";
import { AnnouncementForm } from "../../announcement-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditAnnouncementPage({
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
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href={`/dashboard/announcements/${announcement.id}`} />} nativeButton={false}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Pengumuman</h1>
          <p className="text-muted-foreground">Ubah informasi pengumuman.</p>
        </div>
      </div>
      
      <AnnouncementForm initialData={announcement} />
    </div>
  );
}


