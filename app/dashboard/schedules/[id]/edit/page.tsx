import { ScheduleForm } from "../../schedule-form";
import { getScheduleById } from "@/services/schedule.service";
import { getAllRoles } from "@/services/service-role.service";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/rbac";
import { redirect, notFound } from "next/navigation";

export const metadata = {
  title: "Edit Jadwal | Paroki Sandai",
};

export default async function EditSchedulePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session || !hasPermission(session.user.permissions || [], "schedules", "update")) {
    redirect("/dashboard/schedules");
  }

  const id = parseInt(params.id, 10);
  if (isNaN(id)) return notFound();

  const [schedule, roles] = await Promise.all([
    getScheduleById(id),
    getAllRoles(),
  ]);

  if (!schedule) return notFound();

  // Transform schedule assignments to match the form props
  const formattedSchedule = {
    ...schedule,
    assignments: schedule.assignments.map((a) => ({
      roleId: a.roleId,
      personName: (a as any).personName ?? "",
    })),
  };

  return (
    <div className="space-y-6">
      <ScheduleForm
        initialData={formattedSchedule}
        roles={roles}
      />
    </div>
  );
}
