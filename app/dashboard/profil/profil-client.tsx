"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveOrganizationChart, removeOrganizationChart, saveProfileVideo } from "@/actions/organization.action";
import { saveParishCenter } from "@/actions/parish-center.action";
import { createStation, updateStation, deleteStation } from "@/actions/station.action";
import { saveStatistics } from "@/actions/statistics.action";
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
import { toast } from "sonner";
import { ImageUp, Loader2, Pencil, Trash2, Plus } from "lucide-react";

interface ParishCenterData {
  id: number;
  name: string;
  patron: string;
}

interface StationData {
  id: number;
  name: string;
  patron: string;
  address: string | null;
  orderIndex: number;
}

interface ProfilClientProps {
  videoUrl: string;
  chartUrl: string;
  center: ParishCenterData | null;
  stations: StationData[];
  statJiwa: string;
  statKK: string;
  statTahunPelayanan: string;
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

/* ────────── Tab 1: Video Profil ────────── */

function VideoTab({
  video,
  onVideoChange,
  onSave,
  saving,
}: {
  video: string;
  onVideoChange: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const videoId = extractYouTubeId(video);

  return (
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
            onChange={(e) => onVideoChange(e.target.value)}
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
          <Button onClick={onSave} disabled={saving}>
            {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Simpan Video
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ────────── Tab 2: Bagan Organisasi ────────── */

function OrganizationChartTab({
  chartUrl,
  onSaved,
}: {
  chartUrl: string;
  onSaved: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(chartUrl);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Upload gagal");
      setPreview(data.url);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!preview) return;
    const result = await saveOrganizationChart(preview);
    if (!result?.success) {
      toast.error(result?.error ?? "Gagal menyimpan bagan");
      return;
    }
    toast.success("Bagan organisasi berhasil disimpan");
    router.refresh();
  };

  const handleRemove = () => {
    setPreview("");
    removeOrganizationChart().then((r) => {
      if (!r?.success) {
        toast.error(r?.error ?? "Gagal menghapus bagan");
        return;
      }
      toast.success("Bagan organisasi berhasil dihapus");
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bagan Organisasi</CardTitle>
        <CardDescription>
          Unggah gambar bagan struktur organisasi paroki.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {preview ? (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <img
              src={preview}
              alt="Pratinjau bagan"
              className="mx-auto h-auto w-full max-w-lg object-contain p-4"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 py-12 text-center">
            <ImageUp className="mb-2 h-8 w-8 text-slate-400" />
            <p className="text-sm text-muted-foreground">Belum ada bagan organisasi.</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            {preview ? "Ganti Gambar" : "Pilih Gambar"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          {preview && (
            <Button variant="destructive" onClick={handleRemove}>
              Hapus
            </Button>
          )}
        </div>

        {preview && (
          <div className="flex justify-end">
            <Button onClick={handleSave}>Simpan Bagan</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ────────── Tab 3: Wilayah ────────── */

function StationFormDialog({
  initial,
  onSaved,
  open,
  onOpenChange,
}: {
  initial?: StationData;
  onSaved: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [patron, setPatron] = useState(initial?.patron ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [orderIndex, setOrderIndex] = useState(String(initial?.orderIndex ?? 0));
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      patron,
      address: address || null,
      orderIndex: Number(orderIndex) || 0,
    };

    const result = isEdit
      ? await updateStation(initial!.id, payload)
      : await createStation(payload);

    setSaving(false);
    if (!result?.success) {
      toast.error(result?.error ?? "Gagal menyimpan");
      return;
    }
    toast.success(isEdit ? "Stasi berhasil diperbarui" : "Stasi berhasil ditambahkan");
    onOpenChange(false);
    onSaved();
  }

  function handleDelete() {
    if (!confirm("Hapus stasi ini? Data tidak bisa dikembalikan.")) return;
    deleteStation(initial!.id).then((r) => {
      if (!r?.success) {
        toast.error(r?.error ?? "Gagal menghapus");
        return;
      }
      toast.success("Stasi berhasil dihapus");
      onOpenChange(false);
      onSaved();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Stasi" : "Tambah Stasi"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="s-name">Nama Stasi <span className="text-destructive">*</span></Label>
            <Input
              id="s-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Stasi Santa Maria"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-patron">Pelindung <span className="text-destructive">*</span></Label>
            <Input
              id="s-patron"
              value={patron}
              onChange={(e) => setPatron(e.target.value)}
              required
              placeholder="Santa Maria"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-address">Alamat</Label>
            <Input
              id="s-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Gereja No. 1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-order">Urutan</Label>
            <Input
              id="s-order"
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
              <Button type="button" variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-1 h-4 w-4" /> Hapus
              </Button>
            )}
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Tambah Stasi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function WilayahTab({
  center,
  stations,
  onSaved,
}: {
  center: ParishCenterData | null;
  stations: StationData[];
  onSaved: () => void;
}) {
  const router = useRouter();
  const [parishName, setParishName] = useState(center?.name ?? "");
  const [parishPatron, setParishPatron] = useState(center?.patron ?? "");
  const [savingCenter, setSavingCenter] = useState(false);
  const [stationDialog, setStationDialog] = useState(false);
  const [editingStation, setEditingStation] = useState<StationData | undefined>(undefined);

  const handleSaveCenter = async () => {
    if (!parishName || !parishPatron) return;
    setSavingCenter(true);
    const result = await saveParishCenter({ name: parishName, patron: parishPatron });
    setSavingCenter(false);
    if (!result?.success) {
      toast.error(result?.error ?? "Gagal menyimpan pusat paroki");
      return;
    }
    toast.success("Pusat paroki berhasil disimpan");
    router.refresh();
  };

  const openAdd = () => {
    setEditingStation(undefined);
    setStationDialog(true);
  };

  const openEdit = (s: StationData) => {
    setEditingStation(s);
    setStationDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Pusat Paroki */}
      <Card>
        <CardHeader>
          <CardTitle>Pusat Paroki</CardTitle>
          <CardDescription>
            Data pusat paroki yang ditampilkan di halaman profil.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pc-name">Nama Paroki <span className="text-destructive">*</span></Label>
              <Input
                id="pc-name"
                value={parishName}
                onChange={(e) => setParishName(e.target.value)}
                placeholder="Gereja Katolik Paroki Sandai"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pc-patron">Pelindung <span className="text-destructive">*</span></Label>
              <Input
                id="pc-patron"
                value={parishPatron}
                onChange={(e) => setParishPatron(e.target.value)}
                placeholder="Santa Maria"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveCenter} disabled={savingCenter}>
              {savingCenter && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Simpan Pusat Paroki
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daftar Stasi */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Stasi</CardTitle>
            <CardDescription>Daftar stasi dalam naungan paroki.</CardDescription>
          </div>
          <Button onClick={openAdd}>
            <Plus className="mr-1 h-4 w-4" /> Tambah Stasi
          </Button>
        </CardHeader>
        <CardContent>
          {stations.length === 0 ? (
            <div className="border-2 border-dashed rounded-lg py-12 text-center text-muted-foreground">
              <p className="text-sm">Belum ada data stasi.</p>
              <p className="text-xs mt-1">
                Klik &ldquo;Tambah Stasi&rdquo; untuk menambahkan.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Stasi</TableHead>
                  <TableHead>Pelindung</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead className="w-20">Urutan</TableHead>
                  <TableHead className="w-24">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stations.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.patron}</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {s.address ?? "-"}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {s.orderIndex}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(s)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <StationFormDialog
        initial={editingStation}
        open={stationDialog}
        onOpenChange={setStationDialog}
        onSaved={() => router.refresh()}
      />
    </div>
  );
}

/* ────────── Root ────────── */

export function ProfilClient(props: ProfilClientProps) {
  const { videoUrl, chartUrl, center, stations } = props;
  const router = useRouter();
  const [video, setVideo] = useState(videoUrl);
  const [savingVideo, setSavingVideo] = useState(false);
  const [statJiwa, setStatJiwa] = useState(props.statJiwa);
  const [statKK, setStatKK] = useState(props.statKK);
  const [statTahunPelayanan, setStatTahunPelayanan] = useState(props.statTahunPelayanan);
  const [savingStats, setSavingStats] = useState(false);

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

  const handleSaveStatistics = async () => {
    setSavingStats(true);
    const result = await saveStatistics({
      jiwa: statJiwa || "0",
      kk: statKK || "0",
      tahunPelayanan: statTahunPelayanan,
    });
    setSavingStats(false);
    if (!result?.success) {
      toast.error(result?.error ?? "Gagal menyimpan statistik");
      return;
    }
    toast.success("Statistik berhasil disimpan");
    router.refresh();
  };

  const handleRefresh = () => router.refresh();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Paroki</h1>
        <p className="text-muted-foreground">
          Kelola video profil, bagan organisasi, dan wilayah paroki.
        </p>
      </div>

      <Tabs defaultValue="video">
        <TabsList>
          <TabsTrigger value="video">Video Profil</TabsTrigger>
          <TabsTrigger value="bagan">Bagan Organisasi</TabsTrigger>
          <TabsTrigger value="wilayah">Wilayah</TabsTrigger>
          <TabsTrigger value="statistik">Statistik</TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="mt-4">
          <VideoTab
            video={video}
            onVideoChange={setVideo}
            onSave={handleSaveVideo}
            saving={savingVideo}
          />
        </TabsContent>

        <TabsContent value="bagan" className="mt-4">
          <OrganizationChartTab chartUrl={chartUrl} onSaved={handleRefresh} />
        </TabsContent>

        <TabsContent value="wilayah" className="mt-4">
          <WilayahTab
            center={center}
            stations={stations}
            onSaved={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="statistik">
          <Card>
            <CardHeader>
              <CardTitle>Statistik Paroki</CardTitle>
              <CardDescription>
                Data statistik ditampilkan di halaman beranda dengan animasi hitung.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stat-jiwa">Jiwa Penduduk</Label>
                <Input
                  id="stat-jiwa"
                  type="number"
                  min={0}
                  value={statJiwa}
                  onChange={(e) => setStatJiwa(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stat-kk">Kepala Keluarga</Label>
                <Input
                  id="stat-kk"
                  type="number"
                  min={0}
                  value={statKK}
                  onChange={(e) => setStatKK(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stat-tahun">Tahun Pelayanan</Label>
                <Input
                  id="stat-tahun"
                  type="number"
                  min={0}
                  value={statTahunPelayanan}
                  onChange={(e) => setStatTahunPelayanan(e.target.value)}
                  placeholder="30"
                />
                <p className="text-xs text-muted-foreground">
                  Kosongkan jika tidak ingin ditampilkan di beranda.
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveStatistics} disabled={savingStats}>
                  {savingStats && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  Simpan Statistik
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
