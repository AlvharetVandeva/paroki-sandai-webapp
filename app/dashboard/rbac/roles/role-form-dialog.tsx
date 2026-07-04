"use client";

import { useState } from "react";
import { createRole, updateRole } from "@/app/actions/rbac.action";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit } from "lucide-react";

type Permission = { id: number; action: string; resource: string; description: string | null };
type RoleProps = {
  id: number;
  name: string;
  description: string | null;
  permissions: { permission: Permission }[];
};

export default function RoleFormDialog({
  permissions,
  role,
}: {
  permissions: Permission[];
  role?: RoleProps;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const defaultPermissionIds = role?.permissions.map((rp) => rp.permission.id) || [];
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(defaultPermissionIds);

  const togglePermission = (id: number) => {
    if (selectedPermissions.includes(id)) {
      setSelectedPermissions(selectedPermissions.filter((pid) => pid !== id));
    } else {
      setSelectedPermissions([...selectedPermissions, id]);
    }
  };

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    selectedPermissions.forEach((id) => formData.append("permissions", id.toString()));

    const result = role 
      ? await updateRole(role.id, formData) 
      : await createRole(formData);

    setLoading(false);
    
    if (result?.error) {
      alert("Error: " + JSON.stringify(result.error));
    } else {
      setOpen(false);
    }
  }

  // Group permissions by resource for easier viewing
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          role ? (
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" />
          ) : (
            <Button size="sm" className="gap-1" />
          )
        }
      >
        {role ? (
          <Edit className="h-4 w-4" />
        ) : (
          <>
            <Plus className="h-4 w-4" />
            <span>Tambah Role</span>
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>{role ? "Edit Role" : "Tambah Role Baru"}</DialogTitle>
            <DialogDescription>
              {role ? "Ubah detail dan hak akses role." : "Buat role baru dan tentukan hak aksesnya."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Role</Label>
              <Input
                id="name"
                name="name"
                defaultValue={role?.name}
                required
                placeholder="Contoh: Admin Jadwal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={role?.description || ""}
                placeholder="Deskripsi singkat tentang role ini"
              />
            </div>
            
            <div className="space-y-2 mt-6">
              <Label>Hak Akses (Permissions)</Label>
              <div className="border rounded-md p-4 space-y-6">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource} className="space-y-3">
                    <h4 className="font-semibold text-sm capitalize">{resource}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {perms.map((perm) => (
                        <div key={perm.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`perm-${perm.id}`}
                            checked={selectedPermissions.includes(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor={`perm-${perm.id}`} className="text-sm font-medium leading-none cursor-pointer">
                              {perm.action}
                            </Label>
                            {perm.description && (
                              <p className="text-[0.8rem] text-muted-foreground">
                                {perm.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
