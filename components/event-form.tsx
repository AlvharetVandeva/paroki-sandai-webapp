"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/actions/event.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
    address: string | null;
  };
}

export default function EventForm({ initialData }: EventFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [date, setDate] = useState(
    initialData ? new Date(initialData.date).toISOString().slice(0, 16) : "",
  );
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [latitude, setLatitude] = useState(initialData?.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(initialData?.longitude?.toString() ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!initialData;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = {
      title,
      description: description || undefined,
      date: new Date(date),
      location: location || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      address: address || null,
    };

    try {
      if (isEdit) {
        await updateEvent(initialData.id, data as any);
      } else {
        await createEvent(data as any);
      }
      router.push("/dashboard/events");
      router.refresh();
    } catch {
      setError("Gagal menyimpan kegiatan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? "Edit Kegiatan" : "Tambah Kegiatan"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "Ubah detail kegiatan." : "Buat kegiatan baru."}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Kegiatan</CardTitle>
          <CardDescription>Isi informasi lengkap kegiatan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Judul</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Deskripsi</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input id="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loc">Nama Lokasi</Label>
              <Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Gereja Paroki Sandai" />
            </div>

            <div className="space-y-2">
              <Label>Pilih Lokasi di Peta</Label>
              <div className="flex gap-2 text-xs text-muted-foreground mb-1">
                <span>Lat: {latitude || "—"}</span>
                <span>Lng: {longitude || "—"}</span>
              </div>
              <MapPicker
                latitude={latitude}
                longitude={longitude}
                onLocationChange={(lat, lng, addr) => {
                  setLatitude(lat);
                  setLongitude(lng);
                  if (addr) setAddress(addr);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addr">Alamat Lengkap</Label>
              <Textarea id="addr" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jl. Gereja No. 1, Sandai..." />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Kegiatan"}
              </Button>
              <Link href="/dashboard/events">
                <Button type="button" variant="outline">Batal</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
