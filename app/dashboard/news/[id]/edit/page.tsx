import { getNewsById } from "@/services/news.service";
import { NewsForm } from "../../news-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: paramId } = await params;
  const id = parseInt(paramId);
  if (isNaN(id)) notFound();

  const news = await getNewsById(id);
  if (!news) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href={`/dashboard/news/${id}`} />} nativeButton={false}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Berita</h1>
          <p className="text-muted-foreground">Ubah konten berita atau perbarui informasi.</p>
        </div>
      </div>
      
      <NewsForm initialData={news as any} />
    </div>
  );
}
