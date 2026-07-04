"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteAnnouncement } from "@/actions/announcement.action";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

type Ann = { id: number; title: string; content: string; createdAt: Date };

export function AnnouncementsClient({ announcements }: { announcements: Ann[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function handleDelete() {
    if (deleteId) {
      const result = await deleteAnnouncement(deleteId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Pengumuman berhasil dihapus!");
      }
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengumuman</h1>
          <p className="text-muted-foreground">Kelola pengumuman singkat untuk umat.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/announcements/create")}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Pengumuman
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead className="w-[150px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  Belum ada pengumuman.
                </TableCell>
              </TableRow>
            )}
            {announcements.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">
                  <Link href={`/dashboard/announcements/${a.id}`} className="hover:underline">
                    {a.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(a.createdAt).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" render={<Link href={`/dashboard/announcements/${a.id}`} />} title="Lihat Detail"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" render={<Link href={`/dashboard/announcements/${a.id}/edit`} />} title="Edit"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(a.id)} title="Hapus">
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
            <AlertDialogTitle>Hapus Pengumuman</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengumuman ini? Tindakan ini tidak dapat dibatalkan.
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

