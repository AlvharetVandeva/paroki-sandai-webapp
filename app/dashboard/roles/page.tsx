import { getAllRoles } from "@/services/service-role.service";
import { RolesClient } from "./roles-client";

export default async function RolesPage() {
  const roles = await getAllRoles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Pelayanan</h1>
          <p className="text-muted-foreground">Kelola peran pelayanan seperti Romo, Lektor, dll.</p>
        </div>
      </div>
      <RolesClient roles={roles} />
    </div>
  );
}
