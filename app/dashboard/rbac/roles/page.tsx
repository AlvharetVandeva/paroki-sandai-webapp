import { getRoles, getPermissions } from "@/lib/services/rbac.service";
import RoleFormDialog from "./role-form-dialog";
import { RbacRolesClient } from "./roles-client";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Role</h1>
          <p className="text-muted-foreground">Kelola role dan hak akses (RBAC) pengguna.</p>
        </div>
        <RoleFormDialog permissions={permissions} />
      </div>

      <RbacRolesClient roles={roles} permissions={permissions} />
    </div>
  );
}
