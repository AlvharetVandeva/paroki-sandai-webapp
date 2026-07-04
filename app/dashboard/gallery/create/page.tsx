import { GalleryForm } from "../gallery-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function CreateGalleryPage() {
  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" render={<Link href={`/dashboard/gallery`} />} nativeButton={false}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Album Galeri Baru</h1>
          <p className="text-muted-foreground">Unggah dan kelompokkan foto-foto dokumentasi paroki.</p>
        </div>
      </div>
      <GalleryForm />
    </div>
  );
}
