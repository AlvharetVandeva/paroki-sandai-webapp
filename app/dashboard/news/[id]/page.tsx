import { getNewsById } from "@/services/news.service";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Pencil, User, Calendar } from "lucide-react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default async function NewsDetailPage({
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" render={<Link href="/dashboard/news" />} nativeButton={false}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pratinjau Berita</h1>
            <p className="text-muted-foreground">Lihat bagaimana berita akan tampil.</p>
          </div>
        </div>
        <Button render={<Link href={`/dashboard/news/${id}/edit`} className="inline-flex items-center justify-center" />} nativeButton={false}>
          <Pencil className="mr-2 h-4 w-4" /> Edit Berita
        </Button>
      </div>

      <Card className="overflow-hidden">
        {news.coverImage && (
          <div className="w-full h-64 relative bg-gray-100 dark:bg-gray-800">
            {/* Using regular img for external urls to avoid Next.js domains config issues */}
            <img 
              src={news.coverImage} 
              alt={news.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-3xl lg:text-4xl leading-tight mb-2">
            {news.title}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{news.author.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {news.publishedAt 
                  ? new Date(news.publishedAt).toLocaleDateString("id-ID", {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })
                  : "Belum dipublikasikan (Draft)"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-sm md:prose-base dark:prose-invert max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          {news.images && news.images.length > 0 && (
            <div className="pt-8 border-t">
              <h3 className="text-xl font-bold mb-4">Galeri Foto</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {news.images.map((img: any) => (
                  <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={img.url} 
                      alt={`Gallery ${img.id}`} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
