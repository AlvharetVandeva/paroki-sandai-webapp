"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent, deleteEvent } from "@/actions/event.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Event = { id: number; title: string; description: string | null; date: Date; imageUrl: string | null; location: string | null; latitude: number | null; longitude: number | null; address: string | null };

export function EventsClient({ events }: { events: Event[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Event | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");

  function openCreate() { setEdit(null); setTitle(""); setDescription(""); setDate(""); setLocation(""); setLatitude(""); setLongitude(""); setAddress(""); setOpen(true); }
  function openEdit(e: Event) {
    setEdit(e); setTitle(e.title); setDescription(e.description ?? "");
    setDate(new Date(e.date).toISOString().slice(0, 16));
    setLocation(e.location ?? "");
    setLatitude(e.latitude?.toString() ?? "");
    setLongitude(e.longitude?.toString() ?? "");
    setAddress(e.address ?? "");
    setOpen(true);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const data = {
      title,
      description: description || undefined,
      date: new Date(date),
      location: location || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      address: address || null,
    };
    if (edit) await updateEvent(edit.id, data as any);
    else await createEvent(data as any);
    setOpen(false); router.refresh();
  }

  function handleDelete() { if (deleteId) { deleteEvent(deleteId); setDeleteId(null); router.refresh(); } }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kegiatan</h1>
          <p className="text-muted-foreground">Kelola kegiatan mendatang.</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Tambah Kegiatan</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Belum ada kegiatan.</TableCell>
              </TableRow>
            )}
            {events.map((ev) => (
              <TableRow key={ev.id}>
                <TableCell className="font-medium">{ev.title}</TableCell>
                <TableCell>{new Date(ev.date).toLocaleDateString("id-ID")}</TableCell>
                <TableCell>{ev.location ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">{ev.description ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(ev)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(ev.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit ? "Edit Kegiatan" : "Tambah Kegiatan"}</DialogTitle>
            <DialogDescription>Isi detail kegiatan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Deskripsi</Label>
                <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input id="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loc">Nama Lokasi</Label>
                <Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Gereja Paroki Sandai" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input id="lat" type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="-1.2345" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input id="lng" type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="110.1234" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr">Alamat Lengkap</Label>
                <Textarea id="addr" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jl. Gereja No. 1, Sandai..." />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{edit ? "Simpan" : "Buat"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
