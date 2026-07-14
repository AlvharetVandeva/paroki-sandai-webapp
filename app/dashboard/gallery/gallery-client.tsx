"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteGallery } from "@/actions/gallery.action";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type GalleryItem = {
  id: number;
  title: string;
  coverImage: string | null;
  createdAt: Date;
  _count: { images: number };
};

export function GalleryClient({ galleries }: { galleries: GalleryItem[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function handleDelete() {
    if (deleteId) {
      const result = await deleteGallery(deleteId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Album galeri berhasil dihapus!");
      }
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Galeri Foto</h1>
          <p className="text-muted-foreground">Kelola album dan foto-foto dokumentasi paroki.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/gallery/create")}>
          <Plus className="mr-2 h-4 w-4" /> Buat Album
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sampul</TableHead>
              <TableHead>Judul Album</TableHead>
              <TableHead>Jumlah Foto</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead className="w-[120px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {galleries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Belum ada album galeri.
                </TableCell>
              </TableRow>
            )}
            {galleries.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.coverImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.coverImage} alt={item.title} className="w-16 h-12 object-cover rounded-md border bg-muted" />
                  ) : (
                    <div className="w-16 h-12 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">No img</div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item._count.images} foto</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" render={<Link href={`/dashboard/gallery/${item.id}/edit`} />} nativeButton={false} title="Edit">
                      
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
            <AlertDialogTitle>Hapus Album?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semua foto dalam album ini juga akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
