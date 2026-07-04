"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteEvent } from "@/actions/event.action";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";

type Event = {
  id: number; title: string; description: string | null; date: Date;
  imageUrl: string | null; location: string | null;
  latitude: number | null; longitude: number | null; address: string | null;
};

export function EventsClient({ events }: { events: Event[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function handleDelete() {
    if (deleteId) { deleteEvent(deleteId); setDeleteId(null); router.refresh(); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kegiatan</h1>
          <p className="text-muted-foreground">Kelola kegiatan mendatang.</p>
        </div>
        <Link href="/dashboard/events/create">
          <Button><Plus className="mr-2 h-4 w-4" />Tambah Kegiatan</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Lokasi</TableHead>
              
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">Belum ada kegiatan.</TableCell>
              </TableRow>
            )}
            {events.map((ev) => (
              <TableRow key={ev.id}>
                <TableCell className="font-medium">{ev.title}</TableCell>
                <TableCell>{new Date(ev.date).toLocaleDateString("id-ID")}</TableCell>
                <TableCell>{ev.location ?? "—"}</TableCell>
                
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" render={<Link href={`/dashboard/events/${ev.id}`} />} title="Detail" nativeButton={false}><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" render={<Link href={`/dashboard/events/${ev.id}/edit`} />} title="Edit" nativeButton={false}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(ev.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <AlertDialog open={deleteId === ev.id} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Kegiatan</AlertDialogTitle>
                          <AlertDialogDescription>Hapus "{ev.title}"?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


