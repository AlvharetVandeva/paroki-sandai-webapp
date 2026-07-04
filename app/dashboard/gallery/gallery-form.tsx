"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GallerySchema, GalleryInput } from "@/schemas/gallery.schema";
import { createGallery, updateGallery } from "@/actions/gallery.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, ImageIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type GalleryData = {
  id: number;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  images?: { id: number; url: string; caption?: string | null }[];
};

interface GalleryFormProps {
  initialData?: GalleryData;
}

export function GalleryForm({ initialData }: GalleryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(initialData?.coverImage || null);
  
  // Gallery state
  const [gallery, setGallery] = useState<{ url: string; file?: File; preview?: string }[]>(
    initialData?.images?.map(i => ({ url: i.url })) || []
  );
  
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GalleryInput>({
    resolver: zodResolver(GallerySchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      coverImage: initialData?.coverImage || "",
    },
  });

  const onSubmit = async (data: GalleryInput) => {
    if (gallery.length === 0) {
      setServerError("Harap unggah minimal 1 foto ke dalam galeri.");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    try {
      let finalCoverImageUrl = data.coverImage;

      // Upload Cover
      if (coverFile) {
        const formData = new FormData();
        formData.append("file", coverFile);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadResult = await res.json();
        if (!res.ok || !uploadResult.success) throw new Error(uploadResult.error || "Gagal mengunggah gambar sampul");
        finalCoverImageUrl = uploadResult.url;
      }

      // If no explicit cover image is set but there's a gallery, use the first gallery image later
      let hasExplicitCover = !!finalCoverImageUrl;

      // Upload Gallery Images
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

      if (!hasExplicitCover && finalGalleryUrls.length > 0) {
        finalCoverImageUrl = finalGalleryUrls[0];
      }

      const payload = { 
        ...data, 
        coverImage: finalCoverImageUrl,
        images: finalGalleryUrls
      };

      if (initialData) {
        const result = await updateGallery(initialData.id, payload);
        if (result?.error) throw new Error(result.error);
        toast.success("Album galeri berhasil diperbarui!");
        router.push("/dashboard/gallery");
      } else {
        const result = await createGallery(payload);
        if (result?.error) throw new Error(result.error);
        toast.success("Album galeri berhasil dibuat!");
        router.push("/dashboard/gallery");
      }
    } catch (error: any) {
      let errorMsg = error.message || "Terjadi kesalahan";
      try {
        const parsedError = JSON.parse(errorMsg);
        if (Array.isArray(parsedError)) {
          errorMsg = parsedError.map(e => e.message).join(", ");
        }
      } catch (e) {}
      setServerError(errorMsg);
      toast.error("Gagal menyimpan album, silakan periksa form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Album" : "Buat Album Baru"}</CardTitle>
        <CardDescription>
          Kelola judul album dan unggah banyak foto dokumentasi sekaligus. Semua foto otomatis dikompresi ke WebP.
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
            <Label htmlFor="title">Judul Album</Label>
            <Input
              id="title"
              placeholder="Contoh: Pembukaan Bulan Maria 2026"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi Singkat (Opsional)</Label>
            <Textarea
              id="description"
              placeholder="Berikan sedikit cerita atau konteks mengenai album ini..."
              {...register("description")}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Gambar Sampul Album (Opsional)</Label>
            {coverPreview && (
              <div className="relative w-full h-48 md:h-64 mb-4 rounded-md overflow-hidden bg-muted border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm" 
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setCoverFile(null);
                    setCoverPreview(null);
                    setValue("coverImage", "");
                  }}
                >
                  Hapus Sampul
                </Button>
              </div>
            )}
            
            {!coverPreview && (
              <Input
                id="coverImageFile"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) {
                    setCoverFile(selected);
                    setCoverPreview(URL.createObjectURL(selected));
                  }
                }}
              />
            )}
            <input type="hidden" {...register("coverImage")} />
            <p className="text-xs text-muted-foreground">Jika dikosongkan, sistem akan otomatis menggunakan foto pertama dari galeri sebagai sampul album.</p>
          </div>

          <div className="pt-6 border-t border-dashed">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-5 w-5" />
              <Label className="text-lg font-semibold block">Koleksi Foto Galeri</Label>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Unggah banyak foto sekaligus. Anda bisa memilih beberapa file sekaligus saat dialog pemilihan file terbuka.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {gallery.map((item, index) => (
                <div key={index} className="relative aspect-video rounded-md overflow-hidden bg-muted border group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.preview || item.url} alt={`Gallery ${index}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-1 right-1 h-6 w-6 opacity-80 hover:opacity-100"
                    onClick={() => {
                      setGallery(gallery.filter((_, i) => i !== index));
                    }}
                  >
                    &times;
                  </Button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center aspect-video rounded-md border-2 border-dashed border-gray-300 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                <span className="text-sm font-medium">+ Tambah Foto</span>
                <span className="text-xs text-muted-foreground mt-1 text-center px-2">Bisa pilih banyak file</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  className="hidden" 
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      const newGalleryItems = files.map(f => ({
                        url: "", // Temp url
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

          <div className="flex justify-end space-x-2 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/gallery")}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Simpan Perubahan" : "Buat Album Galeri"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
