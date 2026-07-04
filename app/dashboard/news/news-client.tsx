"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteNews, togglePublishStatus } from "@/actions/news.action";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Eye, EyeOff, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type NewsItem = { 
  id: number; 
  title: string; 
  author: { name: string };
  publishedAt: Date | null;
  createdAt: Date; 
};

export function NewsClient({ news }: { news: NewsItem[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function handleDelete() {
    if (deleteId) {
      const result = await deleteNews(deleteId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Berita berhasil dihapus!");
      }
      setDeleteId(null);
    }
  }

  async function handleTogglePublish(id: number, publish: boolean) {
    const result = await togglePublishStatus(id, publish);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(publish ? "Berita berhasil ditayangkan!" : "Berita berhasil ditarik ke Draft!");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Berita Paroki</h1>
          <p className="text-muted-foreground">Kelola artikel dan berita paroki.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/news/create")}>
          <Plus className="mr-2 h-4 w-4" /> Tulis Berita
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Penulis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead className="w-[150px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Belum ada berita.
                </TableCell>
              </TableRow>
            )}
            {news.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/news/${item.id}`} className="hover:underline">
                    {item.title}
                  </Link>
                </TableCell>
                <TableCell>{item.author.name}</TableCell>
                <TableCell>
                  {item.publishedAt && new Date(item.publishedAt) <= new Date() ? (
                    <Badge variant="default" className="bg-green-600">Dipublikasi</Badge>
                  ) : item.publishedAt ? (
                    <Badge variant="outline" className="text-amber-600 border-amber-600">Terjadwal</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {item.publishedAt ? (
                      <Button variant="ghost" size="icon" onClick={() => handleTogglePublish(item.id, false)} title="Unpublish (Tarik ke Draft)">
                        <EyeOff className="h-4 w-4 text-amber-600" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => handleTogglePublish(item.id, true)} title="Publikasikan Sekarang">
                        <Send className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" render={<Link href={`/dashboard/news/${item.id}`} />} nativeButton={false} title="Lihat Detail">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" render={<Link href={`/dashboard/news/${item.id}/edit`} />} nativeButton={false} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)} title="Hapus">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Berita</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus berita ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
