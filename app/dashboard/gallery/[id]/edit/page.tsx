import { notFound } from "next/navigation";
import { getGalleryById } from "@/services/gallery.service";
import { GalleryForm } from "../../gallery-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function EditGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  if (isNaN(id)) return notFound();

  const gallery = await getGalleryById(id);
  if (!gallery) return notFound();

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" render={<Link href={`/dashboard/gallery`} />} nativeButton={false}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Album Galeri</h1>
          <p className="text-muted-foreground">Ubah judul, deskripsi, atau kelola foto di dalam album ini.</p>
        </div>
      </div>
      <GalleryForm initialData={gallery} />
    </div>
  );
}
