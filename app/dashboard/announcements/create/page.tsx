import { AnnouncementForm } from "../announcement-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function CreateAnnouncementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/announcements">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Pengumuman Baru</h1>
          <p className="text-muted-foreground">Buat pengumuman baru untuk umat.</p>
        </div>
      </div>
      
      <AnnouncementForm />
    </div>
  );
}
