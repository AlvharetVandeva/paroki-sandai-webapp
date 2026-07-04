import { getUsersWithRoles, getRoles } from "@/lib/services/rbac.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AssignRoleDialog from "./assign-role-dialog";
import UserFormDialog from "./user-form-dialog";
import DeleteUserDialog from "./delete-user-dialog";
import { auth } from "@/auth";

export const metadata = {
  title: "Users | Paroki Sandai",
};

export default async function UsersPage() {
  const users = await getUsersWithRoles();
  const roles = await getRoles();
  const session = await auth();
  const currentUserId = session?.user?.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen User</h1>
          <p className="text-muted-foreground">Kelola pengguna sistem dan hak akses (role) mereka.</p>
        </div>
        <UserFormDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>Semua pengguna yang terdaftar di dalam sistem.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.userRoles.map((ur) => (
                        <Badge key={ur.role.id} variant="secondary">
                          {ur.role.name}
                        </Badge>
                      ))}
                      {user.userRoles.length === 0 && (
                        <span className="text-xs text-muted-foreground italic">Tidak ada role</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      <AssignRoleDialog user={user} allRoles={roles} />
                      <UserFormDialog user={user} />
                      {user.id !== currentUserId && (
                        <DeleteUserDialog userId={user.id} userName={user.name} />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Tidak ada pengguna ditemukan.
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
