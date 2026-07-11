"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewsSchema } from "@/schemas/news.schema";
import type { NewsInput } from "@/schemas/news.schema";
import { createNews, updateNews } from "@/actions/news.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

type NewsData = {
  id: number;
  title: string;
  content: string;
  coverImage?: string | null;
  publishedAt?: Date | null;
  images?: { id: number; url: string }[];
};

interface NewsFormProps {
  initialData?: NewsData;
}

export function NewsForm({ initialData }: NewsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialData?.coverImage || null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isDraftCheckbox, setIsDraftCheckbox] = useState<boolean>(initialData ? !initialData.publishedAt : false);
  
  // Gallery state
  const [gallery, setGallery] = useState<{ url: string; file?: File; preview?: string }[]>(
    initialData?.images?.map(i => ({ url: i.url })) || []
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewsInput>({
    resolver: zodResolver(NewsSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      coverImage: initialData?.coverImage || "",
      publishedAt: initialData?.publishedAt ? new Date(initialData.publishedAt) : null,
    },
  });

  const contentValue = watch("content");

  const onSubmit = async (data: NewsInput) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      // Fix date issue based on checkbox
      if (isDraftCheckbox) {
        data.publishedAt = null;
      } else {
        if (!data.publishedAt || isNaN(new Date(data.publishedAt).getTime())) {
          data.publishedAt = new Date(); // Publish immediately if no date selected
        }
      }

      let finalCoverImageUrl = data.coverImage;

      // Handle cover image
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadResult = await res.json();
        if (!res.ok || !uploadResult.success) throw new Error(uploadResult.error || "Gagal mengunggah gambar sampul");
        finalCoverImageUrl = uploadResult.url;
      }

      // Handle gallery images
      const finalGalleryUrls: string[] = [];
      for (const item of gallery) {
        if (item.file) {
          const formData = new FormData();
          formData.append("file", item.file);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const uploadResult = await res.json();
          if (!res.ok || !uploadResult.success) throw new Error(uploadResult.error || "Gagal mengunggah gambar galeri");
          finalGalleryUrls.push(uploadResult.url);
        } else {
          finalGalleryUrls.push(item.url);
        }
      }

      const payload = { 
        ...data, 
        coverImage: finalCoverImageUrl,
        images: finalGalleryUrls
      };

      if (initialData) {
        const result = await updateNews(initialData.id, payload);
        if (result?.error) throw new Error(result.error);
        toast.success("Berita berhasil diperbarui!");
        router.push("/dashboard/news");
      } else {
        const result = await createNews(payload);
        if (result?.error) throw new Error(result.error);
        toast.success(isDraftCheckbox ? "Berita disimpan sebagai draft!" : "Berita berhasil dipublikasikan!");
        router.push("/dashboard/news");
      }
    } catch (error: any) {
      let errorMsg = error.message || "Terjadi kesalahan";
      try {
        const parsedError = JSON.parse(errorMsg);
        if (Array.isArray(parsedError)) {
          errorMsg = parsedError.map(e => e.message).join(", ");
        }
      } catch (e) {
        // Not JSON
      }
      setServerError(errorMsg);
      toast.error("Gagal menyimpan berita, silakan periksa form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Berita" : "Tulis Berita Baru"}</CardTitle>
        <CardDescription>
          Isi detail berita, konten lengkap, dan atur gambar sampul untuk artikel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {(Object.keys(errors).length > 0 || serverError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Peringatan Validasi</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4 mt-2">
                  {serverError && <li>{serverError}</li>}
                  {Object.entries(errors).map(([key, error]) => (
                    <li key={key}>{error.message}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Judul Berita</Label>
            <Input
              id="title"
              placeholder="Masukkan judul berita yang menarik..."
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Gambar Sampul (Opsional)</Label>
            
            {preview && (
              <div className="relative w-full h-48 md:h-64 mb-4 rounded-md overflow-hidden bg-muted border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setValue("coverImage", "");
                  }}
                >
                  Hapus
                </Button>
              </div>
            )}
            
            {!preview && (
              <Input
                id="coverImageFile"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) {
                    setFile(selected);
                    setPreview(URL.createObjectURL(selected));
                  }
                }}
              />
            )}
            {/* Hidden input to satisfy react-hook-form for the string payload */}
            <input type="hidden" {...register("coverImage")} />
            
            {errors.coverImage && (
              <p className="text-sm text-destructive">{errors.coverImage.message}</p>
            )}
            <p className="text-xs text-muted-foreground">Pilih berkas gambar dari perangkat Anda.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Isi Berita</Label>
            <RichTextEditor
              value={contentValue}
              onChange={(val) => setValue("content", val, { shouldValidate: true })}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
            <Checkbox 
              id="isDraftCheckbox" 
              checked={isDraftCheckbox} 
              onCheckedChange={(checked) => setIsDraftCheckbox(checked === true)} 
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="isDraftCheckbox" className="cursor-pointer">Simpan Sebagai Draft</Label>
              <p className="text-sm text-muted-foreground">
                Centang jika Anda belum ingin menayangkan berita ini ke publik.
              </p>
            </div>
          </div>

          {!isDraftCheckbox && (
            <div className="space-y-2 p-4 border rounded-md bg-muted/20">
              <Label htmlFor="publishedAt">Jadwalkan Publikasi (Opsional)</Label>
              <Input
                id="publishedAt"
                type="date"
                {...register("publishedAt", { valueAsDate: true })}
              />
              <p className="text-xs text-muted-foreground">
                Kosongkan untuk langsung menayangkan hari ini, atau atur tanggal di masa depan untuk publikasi otomatis.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-dashed">
            <Label className="text-lg font-semibold mb-1 block">Galeri Foto Ekstra (Opsional)</Label>
            <p className="text-sm text-muted-foreground mb-4">Tambahkan foto-foto lain yang akan ditampilkan berjejer di bawah artikel berita.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {gallery.map((item, index) => (
                <div key={index} className="relative aspect-video rounded-md overflow-hidden bg-muted border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.preview || item.url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => {
                      setGallery(gallery.filter((_, i) => i !== index));
                    }}
                  >
                    &times;
                  </Button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center aspect-video rounded-md border-2 border-dashed border-gray-300 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <span className="text-sm text-muted-foreground">+ Tambah Foto</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  className="hidden" 
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      const newGalleryItems = files.map(f => ({
                        url: "", // Temp url, will be replaced after upload
                        file: f,
                        preview: URL.createObjectURL(f)
                      }));
                      setGallery([...gallery, ...newGalleryItems]);
                    }
                  }} 
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/news")}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Simpan Perubahan" : (isDraftCheckbox ? "Simpan Draft" : "Publikasikan")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
