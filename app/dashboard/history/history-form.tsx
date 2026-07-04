"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSiteSetting } from "@/actions/setting.action";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface HistoryFormProps {
  initialContent: string;
}

export function HistoryForm({ initialContent }: HistoryFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await saveSiteSetting("history", content);
      if (result?.error) throw new Error(result.error);
      
      toast.success("Sejarah Gereja berhasil disimpan!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor Konten</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <RichTextEditor
              value={content}
              onChange={(val) => setContent(val)}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Sejarah
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
