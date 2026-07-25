"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createMember,
  updateMember,
  deleteMember,
  saveProfileVideo,
} from "@/actions/organization.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

interface Member {
  id: number;
  name: string;
  position: string;
  photo: string | null;
  orderIndex: number;
}

interface ProfilClientProps {
  videoUrl: string;
  members: Member[];
}

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

function MemberFormDialog({
  initial,
  onSaved,
  open,
  onOpenChange,
}: {
  initial?: Member;
  onSaved: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [position, setPosition] = useState(initial?.position ?? "");
  const [photo, setPhoto] = useState(initial?.photo ?? "");
  const [orderIndex, setOrderIndex] = useState(
    String(initial?.orderIndex ?? 0)
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Upload gagal");
      setPhoto(data.url);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah foto");
    } finally {
      setUploading(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      position,
      photo: photo || undefined,
      orderIndex: Number(orderIndex) || 0,
    };
    const result = isEdit
      ? await updateMember(initial!.id, payload)
      : await createMember(payload);
    setSaving(false);
    if (!result?.success) {
      toast.error(result?.error ?? "Gagal menyimpan");
      return;
    }
    toast.success(isEdit ? "Anggota berhasil diperbarui" : "Anggota berhasil ditambahkan");
    onOpenChange(false);
    onSaved();
  }

  function handleDelete() {
    if (!confirm("Hapus anggota ini? Data tidak bisa dikembalikan.")) return;
    deleteMember(initial!.id).then((r) => {
      if (!r?.success) {
        toast.error(r?.error ?? "Gagal menghapus");
        return;
      }
      toast.success("Anggota berhasil dihapus");
      onOpenChange(false);
      onSaved();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Anggota" : "Tambah Anggota"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="m-name">Nama <span className="text-destructive">*</span></Label>
            <Input
              id="m-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Romo Yohanes Prasetyo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-position">Jabatan <span className="text-destructive">*</span></Label>
            <Input
              id="m-position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
              placeholder="Pastor Paroki"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-photo">Foto</Label>
            <div className="flex items-center gap-3">
              <Input
                id="m-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="flex-1"
              />
              {uploading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
            </div>
            {photo && (
              <div className="mt-2 flex items-center gap-2">
                <img src={photo} alt="Preview" className="h-10 w-10 rounded-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhoto("")}
                  className="text-xs text-destructive hover:underline"
                >
                  Hapus foto
                </button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-order">Urutan</Label>
            <Input
              id="m-order"
              type="number"
              min={0}
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Angka kecil tampil lebih dahulu.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            {isEdit && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="mr-1 h-4 w-4" /> Hapus
              </Button>
            )}
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Tambah Anggota"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProfilClient({ videoUrl, members }: ProfilClientProps) {
  const router = useRouter();
  const [video, setVideo] = useState(videoUrl);
  const [savingVideo, setSavingVideo] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);

  const videoId = extractYouTubeId(video);

  const handleSaveVideo = async () => {
    setSavingVideo(true);
    const result = await saveProfileVideo(video);
    setSavingVideo(false);
    if (!result?.success) {
      toast.error(result?.error ?? "Gagal menyimpan URL video");
      return;
    }
    toast.success("Video profil berhasil disimpan");
    router.refresh();
  };

  const openAdd = () => {
    setEditingMember(undefined);
    setDialogOpen(true);
  };

  const openEdit = (member: Member) => {
    setEditingMember(member);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Paroki</h1>
        <p className="text-muted-foreground">
          Kelola video profil dan struktur organisasi paroki.
        </p>
      </div>

      <Tabs defaultValue="video">
        <TabsList>
          <TabsTrigger value="video">Video Profil</TabsTrigger>
          <TabsTrigger value="struktur">Struktur Organisasi</TabsTrigger>
        </TabsList>

        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>Video Profil Paroki</CardTitle>
              <CardDescription>
                Masukkan URL video YouTube untuk ditampilkan di halaman profil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-url">URL Video YouTube</Label>
                <Input
                  id="video-url"
                  value={video}
                  onChange={(e) => setVideo(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              {videoId && (
                <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-slate-200">
                  <div className="relative aspect-video w-full">
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                      title="Preview Video Profil"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={handleSaveVideo} disabled={savingVideo}>
                  {savingVideo && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  Simpan Video
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="struktur">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Struktur Organisasi</CardTitle>
                <CardDescription>
                  Daftar anggota struktur organisasi paroki.
                </CardDescription>
              </div>
              <Button onClick={openAdd}>
                <Plus className="mr-1 h-4 w-4" /> Tambah Anggota
              </Button>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                  <p className="text-sm">Belum ada anggota struktur organisasi.</p>
                  <p className="text-xs mt-1">
                    Klik &ldquo;Tambah Anggota&rdquo; untuk menambahkan.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Foto</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Jabatan</TableHead>
                      <TableHead className="w-20">Urutan</TableHead>
                      <TableHead className="w-24">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100">
                            {m.photo ? (
                              <img
                                src={m.photo}
                                alt={m.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs">
                                -
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{m.position}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {m.orderIndex}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEdit(m)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <MemberFormDialog
        initial={editingMember}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}
