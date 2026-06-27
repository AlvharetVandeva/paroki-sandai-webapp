"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSchedule, deleteSchedule } from "@/actions/schedule.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, X } from "lucide-react";

type Role = { id: number; name: string };
type Person = { id: number; fullName: string; role: { id: number; name: string } | null };
type Assignment = { id: number; role: Role; person: Person | null };
type Schedule = { id: number; title: string; startAt: Date; endAt: Date; location: string; description: string | null; assignments: Assignment[] };

export function SchedulesClient({ schedules, roles, persons }: { schedules: Schedule[]; roles: Role[]; persons: Person[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [assignments, setAssignments] = useState<{ roleId: number; personId: number | null }[]>([]);

  function openCreate() {
    setTitle(""); setStartAt(""); setEndAt(""); setLocation(""); setDescription(""); setAssignments([]); setOpen(true);
  }

  function addAssignment() {
    setAssignments([...assignments, { roleId: 0, personId: null }]);
  }

  function updateAssignment(index: number, field: "roleId" | "personId", value: string) {
    const updated = [...assignments];
    updated[index] = { ...updated[index], [field]: field === "roleId" ? Number(value) : value ? Number(value) : null };
    setAssignments(updated);
  }

  function removeAssignment(index: number) {
    setAssignments(assignments.filter((_, i) => i !== index));
  }

  const personsByRole = (roleId: number) => persons.filter((p) => p.role?.id === roleId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createSchedule({
      title,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      location: location || undefined,
      description: description || undefined,
      assignments: assignments.filter((a) => a.roleId > 0),
    });
    setOpen(false);
    router.refresh();
  }

  function handleDelete() {
    if (deleteId) { deleteSchedule(deleteId); setDeleteId(null); router.refresh(); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jadwal Pelayanan</h1>
          <p className="text-muted-foreground">Kelola jadwal misa dan kegiatan pelayanan.</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Tambah Jadwal</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kegiatan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Petugas</TableHead>
              <TableHead className="w-[80px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Belum ada jadwal.</TableCell>
              </TableRow>
            )}
            {schedules.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.title}</TableCell>
                <TableCell>
                  {new Date(s.startAt).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </TableCell>
                <TableCell>{s.location}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {s.assignments.map((a) => (
                      <span key={a.id} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {a.person ? `${a.person.fullName} (${a.role.name})` : a.role.name}
                      </span>
                    ))}
                    {s.assignments.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger onClick={() => setDeleteId(s.id)}>
                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Jadwal</AlertDialogTitle>
                        <AlertDialogDescription>Hapus "{s.title}"?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Jadwal</DialogTitle>
            <DialogDescription>Buat jadwal pelayanan baru.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 px-1 py-2 max-h-[65vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="title">Kegiatan / Misa</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Mulai</Label>
                  <Input id="start" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">Selesai</Label>
                  <Input id="end" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loc">Lokasi</Label>
                <Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Gereja Paroki" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Deskripsi</Label>
                <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <Label className="text-base font-semibold">Petugas Pelayanan</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addAssignment}>
                    <Plus className="mr-1 h-3 w-3" />Tambah
                  </Button>
                </div>
                {assignments.map((a, i) => (
                  <div key={i} className="flex items-end gap-3 rounded-lg border bg-muted/30 p-3">
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-xs font-medium">Pelayanan</Label>
                      <Select value={a.roleId > 0 ? a.roleId.toString() : ""} onValueChange={(v) => updateAssignment(i, "roleId", v ?? "")}>
                        <SelectTrigger><SelectValue placeholder="Pilih pelayanan">{roles.find((r) => r.id === a.roleId)?.name}</SelectValue></SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-xs font-medium">Nama Petugas</Label>
                      <Select value={a.personId?.toString() ?? ""} onValueChange={(v) => updateAssignment(i, "personId", v ?? "")}>
                        <SelectTrigger><SelectValue placeholder="Pilih petugas">{persons.find((p) => p.id === a.personId)?.fullName}</SelectValue></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">— Tidak Ada —</SelectItem>
                          {personsByRole(a.roleId).map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.fullName}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="mt-6" onClick={() => removeAssignment(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {assignments.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    Belum ada petugas. Klik "Tambah" untuk menambahkan.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Buat Jadwal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
