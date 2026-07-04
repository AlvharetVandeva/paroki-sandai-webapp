import { getPermissions } from "@/lib/services/rbac.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PermissionFormDialog from "./permission-form-dialog";
import DeletePermissionDialog from "./delete-permission-dialog";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Permissions | Paroki Sandai",
};

export default async function PermissionsPage() {
  const session = await auth();
  if (!session || !hasPermission(session.user.permissions || [], "rbac", "read")) {
    redirect("/dashboard");
  }

  const permissions = await getPermissions();

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, typeof permissions>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daftar Permissions</h1>
          <p className="text-muted-foreground">Kelola semua hak akses (permissions) sistem.</p>
        </div>
        <PermissionFormDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groupedPermissions).map(([resource, perms]) => (
          <Card key={resource} className="flex flex-col">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="capitalize text-xl">{resource}</CardTitle>
              <CardDescription>
                {perms.length} permission{perms.length > 1 ? "s" : ""} untuk modul {resource}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              <div className="flex flex-col gap-3">
                {perms.map((perm) => (
                  <div key={perm.id} className="flex items-start justify-between p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{perm.action}</Badge>
                        <span className="text-sm font-medium">{perm.action} {perm.resource}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {perm.description || "Tidak ada deskripsi"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <PermissionFormDialog permission={perm} />
                      <DeletePermissionDialog 
                        permissionId={perm.id} 
                        permissionAction={perm.action}
                        permissionResource={perm.resource}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {permissions.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            Tidak ada permission yang ditemukan. Mulai dengan membuat permission baru.
          </div>
        )}
      </div>
    </div>
  );
}
