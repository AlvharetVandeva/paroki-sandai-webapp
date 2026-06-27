import { getAllSchedules } from "@/services/schedule.service";
import { getAllRoles } from "@/services/service-role.service";
import { getAllPersons } from "@/services/person.service";
import { SchedulesClient } from "./schedules-client";

export default async function SchedulesPage() {
  const [schedules, roles, persons] = await Promise.all([
    getAllSchedules(), getAllRoles(), getAllPersons(),
  ]);
  return <SchedulesClient schedules={schedules} roles={roles} persons={persons} />;
}
