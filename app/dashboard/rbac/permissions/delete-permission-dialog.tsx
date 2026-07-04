"use client";

import { useState } from "react";
import { deletePermission } from "@/app/actions/rbac.action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

export default function DeletePermissionDialog({
  permissionId,
  permissionAction,
  permissionResource
}: {
  permissionId: number;
  permissionAction: string;
  permissionResource: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const result = await deletePermission(permissionId);
    setLoading(false);
    
    if (result?.error) {
      alert("Error: " + result.error);
    } else {
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button variant="destructive" size="sm" className="h-8 w-8 p-0" />
        }
      >
        <Trash2 className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Hapus Permission</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus permission <strong>{permissionAction} {permissionResource}</strong>? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Menghapus..." : "Ya, Hapus Permission"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
