"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/actions/event.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const MapPicker = dynamic(() => import("@/components/map-picker"), { ssr: false });

interface EventFormProps {
  initialData?: {
    id: number;
    title: string;
    description: string | null;
    date: Date;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
  };
}

export default function EventForm({ initialData }: EventFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [date, setDate] = useState<Date | undefined>(initialData?.date ? new Date(initialData.date) : undefined);
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [latitude, setLatitude] = useState(initialData?.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(initialData?.longitude?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) {
      toast.error("Tanggal & Waktu kegiatan wajib diisi");
      return;
    }
    if (location.trim().length < 3) {
      toast.error("Nama lokasi wajib diisi minimal 3 karakter");
      return;
    }
    setLoading(true);

    const data = {
      title,
      description: description || undefined,
      date: date as Date,
      location,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      address: null, // intentionally null as it's merged with location
    };

    try {
      if (isEdit) {
        await updateEvent(initialData.id, data as any);
        toast.success("Kegiatan berhasil diperbarui");
      } else {
        await createEvent(data as any);
        toast.success("Kegiatan berhasil ditambahkan");
      }
      router.push("/dashboard/events");
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan kegiatan. Pastikan form valid.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" render={<Link href="/dashboard/events" />} nativeButton={false}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "Perbarui informasi acara paroki." : "Isi form untuk membuat jadwal kegiatan paroki."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom Kiri: Form Text */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detail Acara</CardTitle>
                <CardDescription>Informasi utama tentang kegiatan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Kegiatan <span className="text-destructive">*</span></Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Misa Kaum Muda..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal & Waktu <span className="text-destructive">*</span></Label>
                  <DateTimePicker value={date} onChange={setDate} disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Deskripsi</Label>
                  <RichTextEditor value={description} onChange={setDescription} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kolom Kanan: Peta dan Lokasi */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lokasi Kegiatan</CardTitle>
                <CardDescription>Nama tempat / alamat acara (wajib diisi).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loc">Nama Tempat / Alamat <span className="text-destructive">*</span></Label>
                  <Textarea 
                    id="loc" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    placeholder="Contoh: Gereja Paroki Sandai, Jl. Merdeka No 1" 
                    required 
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">Isi dengan nama bangunan dan alamat lengkapnya.</p>
                </div>
                <div className="space-y-2">
                  <Label>Titik Koordinat (Opsional)</Label>
                  <p className="text-xs text-muted-foreground mb-2">Cari atau geser pin di peta. Jika dibiarkan kosong, koordinat tidak akan disimpan.</p>
                  <div className="flex gap-4 text-xs font-mono bg-muted p-2 rounded-md mb-2">
                    <div>Lat: <span className="font-semibold">{latitude || "-"}</span></div>
                    <div>Lng: <span className="font-semibold">{longitude || "-"}</span></div>
                    {(latitude || longitude) && (
                      <button type="button" onClick={() => { setLatitude(""); setLongitude(""); }} className="ml-auto text-destructive hover:underline">Reset</button>
                    )}
                  </div>
                  <MapPicker
                    latitude={latitude}
                    longitude={longitude}
                    onLocationChange={(lat, lng, addr) => {
                      setLatitude(lat);
                      setLongitude(lng);
                      // Hanya auto-fill lokasi jika lokasi saat ini masih kosong agar ketikan user tidak hilang
                      if (addr && !location) setLocation(addr);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Kegiatan"}
          </Button>
          <Button type="button" variant="outline" render={<Link href="/dashboard/events" />} nativeButton={false}>Batal</Button>
        </div>
      </form>
    </div>
  );
}




