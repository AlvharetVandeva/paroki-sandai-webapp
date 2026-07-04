import { getAllSchedules } from "@/services/schedule.service";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { SchedulesClient } from "./schedules-client";

export const metadata = {
  title: "Jadwal Pelayanan | Paroki Sandai",
};

export default async function SchedulesPage() {
  const session = await auth();
  if (!session || !hasPermission(session.user.permissions || [], "schedules", "read")) {
    redirect("/dashboard");
  }

  const schedules = await getAllSchedules();
  
  const canCreate = hasPermission(session.user.permissions || [], "schedules", "create");
  const canUpdate = hasPermission(session.user.permissions || [], "schedules", "update");
  const canDelete = hasPermission(session.user.permissions || [], "schedules", "delete");

  return (
    <SchedulesClient 
      data={schedules} 
      canCreate={canCreate} 
      canUpdate={canUpdate} 
      canDelete={canDelete} 
    />
  );
}
