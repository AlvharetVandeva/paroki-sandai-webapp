"use client";

import { useState } from "react";
import { createUser, updateUser } from "@/app/actions/rbac.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type UserProps = {
  id: string;
  name: string | null;
  email: string | null;
};

export default function UserFormDialog({ user }: { user?: UserProps }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // For updating, if password is empty, don't send it (will be ignored)
    const result = user 
      ? await updateUser(user.id, formData) 
      : await createUser(formData);

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
          user ? (
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" />
          ) : (
            <Button size="sm" className="gap-1" />
          )
        }
      >
        {user ? (
          <Edit className="h-4 w-4" />
        ) : (
          <>
            <Plus className="h-4 w-4" />
            <span>Tambah User</span>
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>{user ? "Edit User" : "Tambah User"}</DialogTitle>
            <DialogDescription>
              {user ? "Ubah detail informasi user." : "Tambahkan akun pengguna baru ke dalam sistem."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                name="name"
                defaultValue={user?.name || ""}
                required
                placeholder="Nama Lengkap"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user?.email || ""}
                required
                placeholder="email@parokisandai.org"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {user && <span className="text-muted-foreground text-xs font-normal">(Biarkan kosong jika tidak ingin mengubah password)</span>}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required={!user}
                placeholder="Minimal 6 karakter"
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
