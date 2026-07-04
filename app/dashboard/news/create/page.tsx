import { NewsForm } from "../news-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function CreateNewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/dashboard/news" />} nativeButton={false}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tulis Berita Baru</h1>
          <p className="text-muted-foreground">Publikasikan informasi atau liputan kegiatan paroki.</p>
        </div>
      </div>
      
      <NewsForm />
    </div>
  );
}
