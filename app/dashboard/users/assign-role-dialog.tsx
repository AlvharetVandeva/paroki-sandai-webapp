"use client";

import { useState } from "react";
import { assignUserRoles } from "@/app/actions/rbac.action";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";

type Role = { id: number; name: string; description: string | null };
type UserProps = {
  id: string;
  name: string;
  email: string;
  userRoles: { role: Role }[];
};

export default function AssignRoleDialog({
  user,
  allRoles,
}: {
  user: UserProps;
  allRoles: Role[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const defaultRoleIds = user.userRoles.map((ur) => ur.role.id);
  const [selectedRoles, setSelectedRoles] = useState<number[]>(defaultRoleIds);

  const toggleRole = (roleId: number) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter((id) => id !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  async function handleSave() {
    setLoading(true);
    const formData = new FormData();
    formData.append("userId", user.id);
    selectedRoles.forEach((id) => formData.append("roles", id.toString()));

    const result = await assignUserRoles(formData);
    setLoading(false);
    
    if (result?.error) {
      alert(result.error);
    } else {
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button variant="outline" size="sm" className="h-8 gap-1" />
        }
      >
        <Shield className="h-3.5 w-3.5" />
        <span>Atur Role</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atur Role Pengguna</DialogTitle>
          <DialogDescription>
            Pilih role apa saja yang akan diberikan kepada {user.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-4">
            {allRoles.map((role) => (
              <div key={role.id} className="flex items-start space-x-3">
                <Checkbox
                  id={`role-${role.id}`}
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={() => toggleRole(role.id)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor={`role-${role.id}`} className="font-medium cursor-pointer">
                    {role.name}
                  </Label>
                  {role.description && (
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
