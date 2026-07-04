import { getRoles, getPermissions } from "@/lib/services/rbac.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import RoleFormDialog from "./role-form-dialog";
import DeleteRoleDialog from "./delete-role-dialog";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Roles | Paroki Sandai",
};

export default async function RolesPage() {
  const session = await auth();
  if (!session || !hasPermission(session.user.permissions || [], "rbac", "read")) {
    redirect("/dashboard");
  }

  const roles = await getRoles();
  const permissions = await getPermissions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Role</h1>
          <p className="text-muted-foreground">Kelola role dan hak akses pengguna.</p>
        </div>
        <RoleFormDialog permissions={permissions} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Role</CardTitle>
          <CardDescription>Menampilkan semua role beserta jumlah permission yang dimilikinya.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Role</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.length} akses diberikan
                    </div>
                  </TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <RoleFormDialog permissions={permissions} role={role} />
                    <DeleteRoleDialog roleId={role.id} roleName={role.name} />
                  </TableCell>
                </TableRow>
              ))}
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Tidak ada role ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
