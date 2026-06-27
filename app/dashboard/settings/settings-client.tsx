"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSettings } from "@/actions/site-setting.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";

const FIELDS = [
  { key: "siteName", label: "Nama Situs", type: "text" },
  { key: "address", label: "Alamat", type: "text" },
  { key: "phone", label: "Telepon", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "pastorName", label: "Nama Pastor", type: "text" },
  { key: "pastorGreeting", label: "Sambutan Pastor", type: "textarea" },
  { key: "socialMediaFacebook", label: "Facebook", type: "text" },
  { key: "socialMediaInstagram", label: "Instagram", type: "text" },
  { key: "socialMediaYoutube", label: "Youtube", type: "text" },
  { key: "mapEmbedUrl", label: "URL Peta (Embed)", type: "text" },
];

export function SettingsClient({ settings }: { settings: Record<string, string> }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of FIELDS) initial[f.key] = settings[f.key] ?? "";
    return initial;
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await updateSettings(form);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola informasi website paroki.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Website</CardTitle>
          <CardDescription>Data ini akan ditampilkan di halaman publik.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-2">
                <Label htmlFor={f.key}>{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea id={f.key} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} rows={3} />
                ) : (
                  <Input id={f.key} type={f.type} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                )}
              </div>
            ))}
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
