import { getAllRoles } from "@/services/service-role.service";
import { RolesClient } from "./roles-client";

export default async function RolesPage() {
  const roles = await getAllRoles();

  return (
    <div className="space-y-6">
      <RolesClient roles={roles} />
    </div>
  );
}
