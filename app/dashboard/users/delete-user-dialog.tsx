"use client";

import { useState } from "react";
import { deleteUser } from "@/app/actions/rbac.action";
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

export default function DeleteUserDialog({
  userId,
  userName,
}: {
  userId: string;
  userName: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const result = await deleteUser(userId);
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
          <DialogTitle>Hapus User</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus user <strong>{userName}</strong>? Semua data yang terkait dengan user ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Menghapus..." : "Ya, Hapus User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
