import { ScheduleForm } from "../schedule-form";
import { getAllRoles } from "@/services/service-role.service";
import { getAllPersons } from "@/services/person.service";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Tambah Jadwal | Paroki Sandai",
};

export default async function CreateSchedulePage() {
  const session = await auth();
  if (!session || !hasPermission(session.user.permissions || [], "schedules", "create")) {
    redirect("/dashboard/schedules");
  }

  const [roles, persons] = await Promise.all([
    getAllRoles(),
    getAllPersons(),
  ]);

  return (
    <div className="space-y-6">
      <ScheduleForm roles={roles} persons={persons} />
    </div>
  );
}
