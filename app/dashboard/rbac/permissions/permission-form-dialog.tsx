"use client";

import { useState } from "react";
import { createPermission, updatePermission } from "@/app/actions/rbac.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit } from "lucide-react";

type PermissionProps = {
  id: number;
  action: string;
  resource: string;
  description: string | null;
};

export default function PermissionFormDialog({
  permission,
}: {
  permission?: PermissionProps;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = permission 
      ? await updatePermission(permission.id, formData) 
      : await createPermission(formData);

    setLoading(false);
    
    if (result?.error) {
      alert("Error: " + JSON.stringify(result.error));
    } else {
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          permission ? (
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" />
          ) : (
            <Button size="sm" className="gap-1" />
          )
        }
      >
        {permission ? (
          <Edit className="h-4 w-4" />
        ) : (
          <>
            <Plus className="h-4 w-4" />
            <span>Tambah Permission</span>
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>{permission ? "Edit Permission" : "Tambah Permission"}</DialogTitle>
            <DialogDescription>
              {permission ? "Ubah detail permission." : "Buat permission baru untuk membatasi akses pada resource tertentu."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resource">Resource</Label>
              <Input
                id="resource"
                name="resource"
                defaultValue={permission?.resource}
                required
                placeholder="Contoh: users, schedules, dashboard"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Input
                id="action"
                name="action"
                defaultValue={permission?.action}
                required
                placeholder="Contoh: create, read, update, delete"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={permission?.description || ""}
                placeholder="Deskripsi singkat tentang permission ini"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
