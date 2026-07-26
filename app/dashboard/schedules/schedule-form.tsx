"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSchedule, updateSchedule } from "@/actions/schedule.action";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Plus, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/map-picker"), { ssr: false });

type Role = { id: number; name: string };
type Person = { id: number; fullName: string; role: { id: number; name: string } | null };
type Assignment = { roleId: number; personId: number | null };

export interface ScheduleFormProps {
  initialData?: {
    id: number;
    title: string;
    startAt: Date;
    endAt: Date;
    location: string;
    description: string | null;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    assignments: Assignment[];
  };
  roles: Role[];
  persons: Person[];
}

export function ScheduleForm({ initialData, roles, persons }: ScheduleFormProps) {
  const router = useRouter();
  
  const [title, setTitle] = useState(initialData?.title || "");
  const [startAt, setStartAt] = useState<Date | undefined>(
    initialData?.startAt ? new Date(initialData.startAt) : undefined
  );
  const [endAt, setEndAt] = useState<Date | undefined>(
    initialData?.endAt ? new Date(initialData.endAt) : undefined
  );
  const [location, setLocation] = useState(initialData?.location || "");
  const [latitude, setLatitude] = useState(initialData?.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(initialData?.longitude?.toString() ?? "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [assignments, setAssignments] = useState<Assignment[]>(initialData?.assignments || []);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function addAssignment() {
    setAssignments([...assignments, { roleId: 0, personId: null }]);
  }

  function updateAssignment(index: number, field: "roleId" | "personId", value: string) {
    const updated = [...assignments];
    updated[index] = { 
      ...updated[index], 
      [field]: field === "roleId" ? Number(value) : value ? Number(value) : null 
    };
    setAssignments(updated);
  }

  function removeAssignment(index: number) {
    setAssignments(assignments.filter((_, i) => i !== index));
  }

  const personsByRole = (roleId: number) => persons.filter((p) => p.role?.id === roleId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    if (!startAt || !endAt) {
      setFormError("Waktu Mulai dan Waktu Selesai harus diisi");
      setLoading(false);
      return;
    }

    const payload = {
      title,
      startAt: startAt,
      endAt: endAt,
      location: location || "Gereja Paroki",
      description,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      address: null,
      assignments: assignments.filter((a) => a.roleId > 0),
    };

    const result = initialData
      ? await updateSchedule(initialData.id, payload)
      : await createSchedule(payload as any);

    setLoading(false);

    if (!result?.success) {
      setFormError(result?.error ?? "Gagal menyimpan jadwal");
      return;
    }
    
    // Redirect to schedules list on success
    router.push("/dashboard/schedules");
    router.refresh();
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/schedules" className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {initialData ? "Edit Jadwal Pelayanan" : "Tambah Jadwal Baru"}
          </h1>
          <p className="text-muted-foreground">
            {initialData ? "Ubah detail informasi jadwal pelayanan." : "Buat jadwal kegiatan atau misa baru."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom Kiri: Detail Jadwal */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detail Jadwal</CardTitle>
                <CardDescription>Informasi utama tentang jadwal pelayanan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Kegiatan / Judul <span className="text-destructive">*</span></Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Misa Hari Raya..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startAt" className="after:content-['*'] after:ml-0.5 after:text-red-500">Waktu Mulai</Label>
                  <DateTimePicker value={startAt} onChange={setStartAt} disabled={loading} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endAt" className="after:content-['*'] after:ml-0.5 after:text-red-500">Waktu Selesai</Label>
                  <DateTimePicker value={endAt} onChange={setEndAt} disabled={loading} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loc">Lokasi</Label>
                  <Textarea id="loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Gereja Paroki" rows={2} />
                </div>

                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <RichTextEditor value={description} onChange={setDescription} />
                  <p className="text-xs text-muted-foreground">Isikan detail tambahan, panduan singkat, atau teks bacaan jika diperlukan.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kolom Kanan: Peta dan Lokasi */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lokasi di Peta</CardTitle>
                <CardDescription>Nama tempat / alamat kegiatan (opsional).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      if (addr && !location) setLocation(addr);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tugas Pelayanan */}
        <div className="mt-6 space-y-4 pt-6 border-t">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <Label className="text-lg font-semibold block">Tugas Pelayanan</Label>
              <span className="text-sm text-muted-foreground">Tentukan siapa yang bertugas pada kegiatan ini (opsional).</span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addAssignment}>
              <Plus className="mr-1 h-4 w-4" /> Tambah Petugas
            </Button>
          </div>

          <div className="space-y-4">
            {assignments.map((a, i) => (
              <div key={i} className="flex flex-col md:flex-row items-start md:items-end gap-4 rounded-lg border bg-muted/20 p-4">
                <div className="flex-1 space-y-2 w-full">
                  <Label className="text-sm font-medium">Jenis Pelayanan</Label>
                  <Select value={a.roleId > 0 ? a.roleId.toString() : ""} onValueChange={(v) => updateAssignment(i, "roleId", v ?? "")}>
                    <SelectTrigger><SelectValue placeholder="Pilih jenis pelayanan">{roles.find((r) => r.id === a.roleId)?.name}</SelectValue></SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <Label className="text-sm font-medium">Nama Petugas</Label>
                  <Select
                    value={a.personId?.toString() ?? ""}
                    onValueChange={(v) => updateAssignment(i, "personId", v ?? "")}
                    disabled={!a.roleId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={a.roleId ? "Pilih petugas (opsional)" : "Pilih pelayanan dulu"}>
                        {persons.find((p) => p.id === a.personId)?.fullName}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">— Belum Ditentukan —</SelectItem>
                      {personsByRole(a.roleId).map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.fullName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="destructive" size="icon" onClick={() => removeAssignment(i)} className="shrink-0 w-full md:w-10">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {assignments.length === 0 && (
              <div className="text-center py-6 border border-dashed rounded-lg text-muted-foreground bg-muted/10">
                Belum ada penugasan untuk jadwal ini.
              </div>
            )}
          </div>
        </div>

        {formError && (
          <div className="mt-6 p-3 bg-destructive/15 text-destructive rounded-md text-sm">
            {formError}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
          <Link href="/dashboard/schedules" className={buttonVariants({ variant: "outline" }) + (loading ? " pointer-events-none opacity-50" : "")}>
            Batal
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Jadwal"}
          </Button>
        </div>
      </form>
    </div>
  );
}
