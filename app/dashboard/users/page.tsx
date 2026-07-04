import { getUsersWithRoles, getRoles } from "@/lib/services/rbac.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UserFormDialog from "./user-form-dialog";
import { UsersClient } from "./users-client";
import { hasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata = {
  title: "Users | Paroki Sandai",
};

export default async function UsersPage() {
  const session = await auth();
  if (!session || !hasPermission(session.user.permissions || [], "users", "read")) {
    redirect("/dashboard");
  }

  const users = await getUsersWithRoles();
  const roles = await getRoles();
  const currentUserId = session?.user?.id || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen User</h1>
          <p className="text-muted-foreground">Kelola pengguna sistem dan hak akses (role) mereka.</p>
        </div>
        <UserFormDialog />
      </div>

      <UsersClient users={users} allRoles={roles} currentUserId={currentUserId} />
    </div>
  );
}
