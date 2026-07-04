"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnnouncementSchema, AnnouncementInput } from "@/schemas/announcement.schema";
import { createAnnouncement, updateAnnouncement } from "@/actions/announcement.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type Announcement = {
  id: number;
  title: string;
  content: string;
};

interface AnnouncementFormProps {
  initialData?: Announcement;
}

export function AnnouncementForm({ initialData }: AnnouncementFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AnnouncementInput>({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
    },
  });

  const contentValue = watch("content");

  const onSubmit = async (data: AnnouncementInput) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        const result = await updateAnnouncement(initialData.id, data);
        if (result?.error) throw new Error(result.error);
        toast.success("Pengumuman berhasil diperbarui!");
      } else {
        const result = await createAnnouncement(data);
        if (result?.error) throw new Error(result.error);
        toast.success("Pengumuman berhasil ditambahkan!");
      }
      router.push("/dashboard/announcements");
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Pengumuman" : "Tambah Pengumuman"}</CardTitle>
        <CardDescription>
          Isi detail pengumuman yang akan dipublikasikan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Pengumuman</Label>
            <Input
              id="title"
              placeholder="Masukkan judul pengumuman..."
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Isi Pengumuman</Label>
            <RichTextEditor
              value={contentValue}
              onChange={(val) => setValue("content", val, { shouldValidate: true })}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/announcements")}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Simpan Perubahan" : "Buat Pengumuman"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
